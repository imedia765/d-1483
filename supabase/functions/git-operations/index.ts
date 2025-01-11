import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Octokit } from 'https://esm.sh/octokit'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const log = {
  success: (message: string, data?: any) => {
    console.log('\x1b[32m%s\x1b[0m', '✓ SUCCESS:', message);
    if (data) console.log(JSON.stringify(data, null, 2));
  },
  error: (message: string, error?: any) => {
    console.error('\x1b[31m%s\x1b[0m', '✗ ERROR:', message);
    if (error) {
      console.error('\x1b[31m%s\x1b[0m', '  Details:');
      if (error.status) console.error('\x1b[31m%s\x1b[0m', `  Status: ${error.status}`);
      if (error.message) console.error('\x1b[31m%s\x1b[0m', `  Message: ${error.message}`);
      if (error.response?.data) {
        console.error('\x1b[31m%s\x1b[0m', '  Response Data:');
        console.error(JSON.stringify(error.response.data, null, 2));
      }
      if (error.stack) {
        console.error('\x1b[31m%s\x1b[0m', '  Stack Trace:');
        console.error(error.stack);
      }
    }
  },
  info: (message: string, data?: any) => {
    console.log('\x1b[36m%s\x1b[0m', 'ℹ INFO:', message);
    if (data) console.log(JSON.stringify(data, null, 2));
  },
  sql: (query: string, params?: any) => {
    console.log('\x1b[35m%s\x1b[0m', '🗄 SQL:', query);
    if (params) console.log('\x1b[35m%s\x1b[0m', '  Params:', JSON.stringify(params, null, 2));
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, sourceRepoId, targetRepoId, pushType } = await req.json();
    log.info('Received operation:', { type, sourceRepoId, targetRepoId, pushType });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const githubToken = Deno.env.get('GITHUB_ACCESS_TOKEN');
    if (!githubToken) {
      log.error('GitHub token not found');
      throw new Error('GitHub token not configured');
    }

    const octokit = new Octokit({
      auth: githubToken
    });

    // Helper function to extract owner and repo name from GitHub URL
    const extractRepoInfo = (url: string) => {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
      if (!match) {
        throw new Error(`Invalid GitHub URL format: ${url}`);
      }
      return { owner: match[1], repo: match[2] };
    };

    // Helper function to get repository details
    const getRepoDetails = async (repoId: string) => {
      const query = `SELECT * FROM repositories WHERE id = $1`;
      log.sql(query, [repoId]);
      
      const { data: repo, error: repoError } = await supabaseClient
        .from('repositories')
        .select('*')
        .eq('id', repoId)
        .single();

      if (repoError) {
        log.error('Database error when fetching repository:', repoError);
        throw repoError;
      }
      if (!repo) {
        log.error('Repository not found:', { repoId });
        throw new Error(`Repository not found: ${repoId}`);
      }
      
      const { owner, repo: repoName } = extractRepoInfo(repo.url);
      log.info('Repository details:', { owner, repoName, url: repo.url });
      return { repo, owner, repoName };
    };

    // Helper function to get the default branch
    const getDefaultBranch = async (owner: string, repo: string) => {
      const { data: repoInfo } = await octokit.rest.repos.get({
        owner,
        repo,
      });
      return repoInfo.default_branch;
    };

    // Helper function to ensure branch exists
    const ensureBranchExists = async (owner: string, repo: string, branch: string, sourceSha: string) => {
      try {
        // Try to get the branch
        const { data: branchData } = await octokit.rest.repos.getBranch({
          owner,
          repo,
          branch,
        });
        log.success(`Branch exists: ${branch}`, branchData);
        return branchData;
      } catch (error) {
        if (error.status === 404) {
          // Branch doesn't exist, create it
          log.info(`Creating branch ${branch} from ${sourceSha}`);
          try {
            await octokit.rest.git.createRef({
              owner,
              repo,
              ref: `refs/heads/${branch}`,
              sha: sourceSha,
            });
            log.success(`Created branch: ${branch}`);
            return await octokit.rest.repos.getBranch({
              owner,
              repo,
              branch,
            });
          } catch (createError) {
            log.error(`Failed to create branch: ${branch}`, createError);
            throw createError;
          }
        }
        throw error;
      }
    };

    if (type === 'getLastCommit') {
      log.info('Getting last commit for repo:', sourceRepoId);
      
      const { repo, owner, repoName } = await getRepoDetails(sourceRepoId);
      log.success('Found repository:', repo.url);

      const defaultBranch = await getDefaultBranch(owner, repoName);
      
      const { data: commit } = await octokit.rest.repos.getCommit({
        owner,
        repo: repoName,
        ref: defaultBranch,
      });

      log.success('Got commit:', commit.sha);

      const updateQuery = `
        UPDATE repositories 
        SET last_commit = $1, 
            last_commit_date = $2, 
            last_sync = $3, 
            status = $4 
        WHERE id = $5
      `;
      
      log.sql(updateQuery, [
        commit.sha,
        commit.commit.author?.date,
        new Date().toISOString(),
        'synced',
        sourceRepoId
      ]);

      await supabaseClient
        .from('repositories')
        .update({ 
          last_commit: commit.sha,
          last_commit_date: commit.commit.author?.date,
          last_sync: new Date().toISOString(),
          status: 'synced'
        })
        .eq('id', sourceRepoId);

      return new Response(
        JSON.stringify({ success: true, commit }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (type === 'push' && targetRepoId) {
      log.info('Starting push operation');
      
      const sourceDetails = await getRepoDetails(sourceRepoId);
      const targetDetails = await getRepoDetails(targetRepoId);

      log.info('Processing repositories:', {
        source: sourceDetails.repo.url,
        target: targetDetails.repo.url
      });

      // Get source repository info and latest commit
      const sourceDefaultBranch = await getDefaultBranch(sourceDetails.owner, sourceDetails.repoName);
      log.success('Source branch found:', sourceDefaultBranch);

      const targetDefaultBranch = await getDefaultBranch(targetDetails.owner, targetDetails.repoName);
      log.success('Target branch found:', targetDefaultBranch);

      // Get source commit
      const { data: sourceCommit } = await octokit.rest.repos.getCommit({
        owner: sourceDetails.owner,
        repo: sourceDetails.repoName,
        ref: sourceDefaultBranch
      });

      // Ensure target branch exists
      await ensureBranchExists(
        targetDetails.owner,
        targetDetails.repoName,
        targetDefaultBranch,
        sourceCommit.sha
      );

      try {
        if (pushType === 'force' || pushType === 'force-with-lease') {
          log.info('Performing force push...');
          await octokit.rest.git.updateRef({
            owner: targetDetails.owner,
            repo: targetDetails.repoName,
            ref: `heads/${targetDefaultBranch}`,
            sha: sourceCommit.sha,
            force: true
          });
          log.success('Force push completed');
        } else {
          log.info('Performing regular merge...');
          await octokit.rest.repos.merge({
            owner: targetDetails.owner,
            repo: targetDetails.repoName,
            base: targetDefaultBranch,
            head: sourceCommit.sha,
            commit_message: `Merge from ${sourceDetails.repo.nickname || sourceDetails.repo.url} using ${pushType} strategy`
          });
          log.success('Regular merge completed');
        }

        // Update repositories status
        const timestamp = new Date().toISOString();
        await supabaseClient
          .from('repositories')
          .update({ 
            last_sync: timestamp,
            status: 'synced',
            last_commit: sourceCommit.sha,
            last_commit_date: timestamp
          })
          .in('id', [sourceRepoId, targetRepoId]);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Push operation completed successfully using ${pushType} strategy`,
            sha: sourceCommit.sha
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        log.error(`${pushType} operation failed:`, error);
        throw error;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Git ${type} operation completed successfully`,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    log.error('Error in git-operations function:', error);
    
    // Enhanced error response
    const errorResponse = {
      success: false,
      error: error.message,
      details: {
        status: error.status,
        name: error.name,
        message: error.message,
        response: error.response?.data,
        documentation_url: error.response?.data?.documentation_url,
        stack: error.stack
      }
    };

    return new Response(
      JSON.stringify(errorResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});