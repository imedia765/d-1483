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

log.info('Git Operations Function Started');

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

    if (type === 'getLastCommit') {
      log.info('Getting last commit for repo:', sourceRepoId);
      
      const { data: repo, error: repoError } = await supabaseClient
        .from('repositories')
        .select('url')
        .eq('id', sourceRepoId)
        .single();

      if (repoError) {
        log.error('Database error:', repoError);
        throw repoError;
      }
      if (!repo) {
        log.error('Repository not found:', sourceRepoId);
        throw new Error('Repository not found');
      }

      log.success('Found repository:', repo.url);

      const [, owner, repoName] = repo.url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/) || [];
      if (!owner || !repoName) {
        log.error('Invalid repository URL format:', repo.url);
        throw new Error('Invalid repository URL format');
      }

      log.info('Fetching commit for:', { owner, repoName });
      
      const { data: repoInfo } = await octokit.rest.repos.get({
        owner,
        repo: repoName
      });

      const { data: commit } = await octokit.rest.repos.getCommit({
        owner,
        repo: repoName,
        ref: repoInfo.default_branch
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
      
      const { data: repos, error: reposError } = await supabaseClient
        .from('repositories')
        .select('*')
        .in('id', [sourceRepoId, targetRepoId]);

      if (reposError) {
        log.error('Database error:', reposError);
        throw reposError;
      }

      const sourceRepo = repos.find(r => r.id === sourceRepoId);
      const targetRepo = repos.find(r => r.id === targetRepoId);

      if (!sourceRepo || !targetRepo) {
        log.error('Repository not found:', { sourceRepoId, targetRepoId });
        throw new Error('Source or target repository not found');
      }

      log.info('Processing repositories:', {
        source: sourceRepo.url,
        target: targetRepo.url
      });

      // Extract owner and repo name from URLs
      const [, sourceOwner, sourceRepoName] = sourceRepo.url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/) || [];
      const [, targetOwner, targetRepoName] = targetRepo.url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/) || [];

      if (!sourceOwner || !sourceRepoName || !targetOwner || !targetRepoName) {
        log.error('Invalid repository URL format:', { sourceRepo: sourceRepo.url, targetRepo: targetRepo.url });
        throw new Error('Invalid repository URL format');
      }

      try {
        // Get source repository info
        const { data: sourceRepoInfo } = await octokit.rest.repos.get({
          owner: sourceOwner,
          repo: sourceRepoName
        });

        log.info('Source repo info:', {
          defaultBranch: sourceRepoInfo.default_branch
        });

        // Get source branch information and latest commit
        let sourceBranch;
        try {
          const { data } = await octokit.rest.repos.getBranch({
            owner: sourceOwner,
            repo: sourceRepoName,
            branch: sourceRepoInfo.default_branch,
          });
          sourceBranch = data;
          log.success('Source branch found:', sourceBranch.name);
        } catch (error) {
          log.error('Error getting source branch:', error);
          throw new Error(`Source branch does not exist: ${error.message}`);
        }

        // Get target repository info
        const { data: targetRepoInfo } = await octokit.rest.repos.get({
          owner: targetOwner,
          repo: targetRepoName
        });

        log.info('Target repo info:', {
          defaultBranch: targetRepoInfo.default_branch
        });

        // Check if target branch exists
        let targetBranch;
        try {
          const { data } = await octokit.rest.repos.getBranch({
            owner: targetOwner,
            repo: targetRepoName,
            branch: targetRepoInfo.default_branch,
          });
          targetBranch = data;
          log.success('Target branch found:', targetBranch.name);
        } catch (error) {
          if (error.status === 404) {
            log.info('Target branch does not exist, creating it...');
            try {
              // Get the default branch's latest commit SHA
              const { data: defaultBranch } = await octokit.rest.repos.getBranch({
                owner: targetOwner,
                repo: targetRepoName,
                branch: 'main', // Try main first
              });
              
              // Create the new branch from the default branch
              await octokit.rest.git.createRef({
                owner: targetOwner,
                repo: targetRepoName,
                ref: `refs/heads/${targetRepoInfo.default_branch}`,
                sha: defaultBranch.commit.sha
              });
              
              log.success('Created new target branch');
              
              // Get the newly created branch
              const { data } = await octokit.rest.repos.getBranch({
                owner: targetOwner,
                repo: targetRepoName,
                branch: targetRepoInfo.default_branch,
              });
              targetBranch = data;
            } catch (createError) {
              log.error('Error creating target branch:', createError);
              throw new Error(`Failed to create target branch: ${createError.message}`);
            }
          } else {
            log.error('Error getting target branch:', error);
            throw error;
          }
        }

        let mergeResult;
        if (pushType === 'force' || pushType === 'force-with-lease') {
          log.info('Performing force push...');
          try {
            mergeResult = await octokit.rest.git.updateRef({
              owner: targetOwner,
              repo: targetRepoName,
              ref: `heads/${targetRepoInfo.default_branch}`,
              sha: sourceBranch.commit.sha,
              force: true
            });
            log.success('Force push successful:', mergeResult);
          } catch (error) {
            log.error('Force push failed:', error);
            throw new Error(`Force push failed: ${error.message}`);
          }
        } else {
          log.info('Performing regular merge...');
          try {
            mergeResult = await octokit.rest.repos.merge({
              owner: targetOwner,
              repo: targetRepoName,
              base: targetRepoInfo.default_branch,
              head: sourceBranch.commit.sha,
              commit_message: `Merge from ${sourceRepo.nickname || sourceRepo.url} using ${pushType} strategy`
            });
            log.success('Regular merge successful:', mergeResult);
          } catch (error) {
            log.error('Regular merge failed:', error);
            throw new Error(`Regular merge failed: ${error.message}`);
          }
        }

        // Update repositories status
        const timestamp = new Date().toISOString();
        await supabaseClient
          .from('repositories')
          .update({ 
            last_sync: timestamp,
            status: 'synced',
            last_commit: sourceBranch.commit.sha,
            last_commit_date: new Date().toISOString()
          })
          .in('id', [sourceRepoId, targetRepoId]);

        log.success('Push operation completed successfully');

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Push operation completed successfully`,
            mergeResult: mergeResult
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        log.error('Error during git operation:', error);
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