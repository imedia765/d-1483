import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Octokit } from 'https://esm.sh/octokit'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Utility function for consistent logging
const log = {
  success: (message: string, data?: any) => {
    console.log('\x1b[32m%s\x1b[0m', '✓ SUCCESS:', message);
    if (data) console.log(JSON.stringify(data, null, 2));
  },
  error: (message: string, error?: any) => {
    console.error('\x1b[31m%s\x1b[0m', '✗ ERROR:', message);
    if (error) console.error(error);
  },
  info: (message: string, data?: any) => {
    console.log('\x1b[36m%s\x1b[0m', 'ℹ INFO:', message);
    if (data) console.log(JSON.stringify(data, null, 2));
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
      const { data: repo, error: repoError } = await supabaseClient
        .from('repositories')
        .select('*')
        .eq('id', repoId)
        .single();

      if (repoError) throw repoError;
      if (!repo) throw new Error(`Repository not found: ${repoId}`);
      
      const { owner, repo: repoName } = extractRepoInfo(repo.url);
      return { repo, owner, repoName };
    };

    // Helper function to ensure branch exists
    const ensureBranchExists = async (owner: string, repo: string, branch: string, sourceSha?: string) => {
      try {
        const { data: branchData } = await octokit.rest.repos.getBranch({
          owner,
          repo,
          branch,
        });
        log.success(`Branch exists: ${branch}`, branchData);
        return branchData;
      } catch (error) {
        if (error.status === 404 && sourceSha) {
          log.info(`Creating branch ${branch} with SHA ${sourceSha}`);
          await octokit.rest.git.createRef({
            owner,
            repo,
            ref: `refs/heads/${branch}`,
            sha: sourceSha,
          });
          const { data } = await octokit.rest.repos.getBranch({
            owner,
            repo,
            branch,
          });
          log.success(`Created new branch: ${branch}`, data);
          return data;
        }
        throw error;
      }
    };

    if (type === 'getLastCommit') {
      log.info('Getting last commit for repo:', sourceRepoId);
      
      const { repo, owner, repoName } = await getRepoDetails(sourceRepoId);
      log.success('Found repository:', repo.url);

      const { data: repoInfo } = await octokit.rest.repos.get({
        owner,
        repo: repoName,
      });

      const { data: commit } = await octokit.rest.repos.getCommit({
        owner,
        repo: repoName,
        ref: repoInfo.default_branch,
      });

      log.success('Got commit:', commit.sha);

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
      const { data: sourceRepoInfo } = await octokit.rest.repos.get({
        owner: sourceDetails.owner,
        repo: sourceDetails.repoName
      });

      // Get source commit
      const { data: sourceCommit } = await octokit.rest.repos.getCommit({
        owner: sourceDetails.owner,
        repo: sourceDetails.repoName,
        ref: sourceRepoInfo.default_branch
      });

      // Ensure target branch exists
      await ensureBranchExists(
        targetDetails.owner,
        targetDetails.repoName,
        sourceRepoInfo.default_branch,
        sourceCommit.sha
      );

      try {
        if (pushType === 'force' || pushType === 'force-with-lease') {
          log.info('Performing force push...');
          await octokit.rest.git.updateRef({
            owner: targetDetails.owner,
            repo: targetDetails.repoName,
            ref: `heads/${sourceRepoInfo.default_branch}`,
            sha: sourceCommit.sha,
            force: true
          });
          log.success('Force push completed');
        } else {
          log.info('Performing regular merge...');
          await octokit.rest.repos.merge({
            owner: targetDetails.owner,
            repo: targetDetails.repoName,
            base: sourceRepoInfo.default_branch,
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
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.response?.data || error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});