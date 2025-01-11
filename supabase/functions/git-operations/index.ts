import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Octokit } from 'https://esm.sh/octokit'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('Git Operations Function Started');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, sourceRepoId, targetRepoId, pushType } = await req.json();
    console.log('Received operation:', { type, sourceRepoId, targetRepoId, pushType });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const githubToken = Deno.env.get('GITHUB_ACCESS_TOKEN');
    if (!githubToken) {
      console.error('GitHub token not found');
      throw new Error('GitHub token not configured');
    }

    const octokit = new Octokit({
      auth: githubToken
    });

    if (type === 'getLastCommit') {
      console.log('Getting last commit for repo:', sourceRepoId);
      
      const { data: repo, error: repoError } = await supabaseClient
        .from('repositories')
        .select('url')
        .eq('id', sourceRepoId)
        .single();

      if (repoError) throw repoError;
      if (!repo) throw new Error('Repository not found');

      console.log('Found repository:', repo.url);

      const [, owner, repoName] = repo.url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/) || [];
      if (!owner || !repoName) throw new Error('Invalid repository URL format');

      console.log('Fetching commit for:', { owner, repoName });
      
      const { data: repoInfo } = await octokit.rest.repos.get({
        owner,
        repo: repoName
      });

      const { data: commit } = await octokit.rest.repos.getCommit({
        owner,
        repo: repoName,
        ref: repoInfo.default_branch
      });

      console.log('Got commit:', commit.sha);

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
      console.log('Starting push operation');
      
      const { data: repos, error: reposError } = await supabaseClient
        .from('repositories')
        .select('*')
        .in('id', [sourceRepoId, targetRepoId]);

      if (reposError) throw reposError;

      const sourceRepo = repos.find(r => r.id === sourceRepoId);
      const targetRepo = repos.find(r => r.id === targetRepoId);

      if (!sourceRepo || !targetRepo) {
        throw new Error('Source or target repository not found');
      }

      console.log('Processing repositories:', {
        source: sourceRepo.url,
        target: targetRepo.url
      });

      // Extract owner and repo name from URLs
      const [, sourceOwner, sourceRepoName] = sourceRepo.url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/) || [];
      const [, targetOwner, targetRepoName] = targetRepo.url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/) || [];

      if (!sourceOwner || !sourceRepoName || !targetOwner || !targetRepoName) {
        throw new Error('Invalid repository URL format');
      }

      try {
        // Get source repository info
        const { data: sourceRepoInfo } = await octokit.rest.repos.get({
          owner: sourceOwner,
          repo: sourceRepoName
        });

        console.log('Source repo info:', {
          defaultBranch: sourceRepoInfo.default_branch
        });

        // Get the latest commit from source
        const { data: sourceBranch } = await octokit.rest.repos.getBranch({
          owner: sourceOwner,
          repo: sourceRepoName,
          branch: sourceRepoInfo.default_branch,
        });

        // Get target repository info
        const { data: targetRepoInfo } = await octokit.rest.repos.get({
          owner: targetOwner,
          repo: targetRepoName
        });

        console.log('Target repo info:', {
          defaultBranch: targetRepoInfo.default_branch
        });

        // First, try to get the target branch reference
        let targetRef;
        try {
          const { data: ref } = await octokit.rest.git.getRef({
            owner: targetOwner,
            repo: targetRepoName,
            ref: `heads/${targetRepoInfo.default_branch}`
          });
          targetRef = ref;
          console.log('Found existing target branch:', targetRef);
        } catch (error) {
          if (error.status === 404) {
            console.log('Target branch does not exist, creating it...');
            try {
              // Create the branch with the source commit
              const { data: newRef } = await octokit.rest.git.createRef({
                owner: targetOwner,
                repo: targetRepoName,
                ref: `refs/heads/${targetRepoInfo.default_branch}`,
                sha: sourceBranch.commit.sha
              });
              targetRef = newRef;
              console.log('Created new target branch:', targetRef);
            } catch (createError) {
              console.error('Error creating target branch:', createError);
              throw new Error(`Failed to create target branch: ${createError.message}`);
            }
          } else {
            console.error('Error getting target branch:', error);
            throw error;
          }
        }

        let mergeResult;
        if (pushType === 'force' || pushType === 'force-with-lease') {
          console.log('Performing force push...');
          try {
            mergeResult = await octokit.rest.git.updateRef({
              owner: targetOwner,
              repo: targetRepoName,
              ref: `heads/${targetRepoInfo.default_branch}`,
              sha: sourceBranch.commit.sha,
              force: true
            });
            console.log('Force push successful:', mergeResult);
          } catch (error) {
            console.error('Force push failed:', error);
            throw new Error(`Force push failed: ${error.message}`);
          }
        } else {
          console.log('Performing regular merge...');
          try {
            mergeResult = await octokit.rest.repos.merge({
              owner: targetOwner,
              repo: targetRepoName,
              base: targetRepoInfo.default_branch,
              head: sourceBranch.commit.sha,
              commit_message: `Merge from ${sourceRepo.nickname || sourceRepo.url} using ${pushType} strategy`
            });
            console.log('Regular merge successful:', mergeResult);
          } catch (error) {
            console.error('Regular merge failed:', error);
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

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Push operation completed successfully`,
            mergeResult: mergeResult.data
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error during git operation:', error);
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
    console.error('Error in git-operations function:', error);
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