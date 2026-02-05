/**
 * Bounty Auto-Claim GitHub Action
 * 
 * Monitors AI Bounty Board for new bounties matching specified criteria
 * and automatically claims them for your wallet.
 * 
 * @author kevi-ai
 * @license MIT
 */

const core = require('@actions/core');

const API_BASE = core.getInput('api_url') || 'https://bounty.owockibot.xyz';

// Parse USDC reward (6 decimals)
function parseReward(raw) {
  return parseFloat(raw || '0') / 1e6;
}

// Fetch bounties from API
async function fetchBounties() {
  const response = await fetch(`${API_BASE}/bounties`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

// Claim a bounty
async function claimBounty(id, wallet, name) {
  const response = await fetch(`${API_BASE}/bounties/${id}/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet, name: name || undefined }),
  });
  
  const data = await response.json();
  return {
    success: response.ok,
    message: data.message || (response.ok ? 'Claimed' : 'Failed'),
  };
}

// Filter bounties based on criteria
function filterBounties(bounties, options) {
  const { tags, minReward } = options;
  const tagList = tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];
  
  return bounties.filter(bounty => {
    // Only open bounties
    if (bounty.status !== 'open') return false;
    
    // Check minimum reward
    const reward = parseReward(bounty.reward);
    if (reward < minReward) return false;
    
    // Check tags (if specified, at least one must match)
    if (tagList.length > 0) {
      const bountyTags = (bounty.tags || []).map(t => t.toLowerCase());
      const hasMatchingTag = tagList.some(tag => bountyTags.includes(tag));
      if (!hasMatchingTag) return false;
    }
    
    return true;
  });
}

async function run() {
  try {
    // Get inputs
    const walletAddress = core.getInput('wallet_address', { required: true });
    const claimerName = core.getInput('claimer_name') || '';
    const tags = core.getInput('tags') || '';
    const minReward = parseFloat(core.getInput('min_reward')) || 0;
    const maxClaims = parseInt(core.getInput('max_claims')) || 1;
    const dryRun = core.getInput('dry_run') === 'true';

    core.info('🎯 Bounty Auto-Claim Action');
    core.info(`📍 API: ${API_BASE}`);
    core.info(`💰 Min Reward: $${minReward} USDC`);
    core.info(`🏷️ Tags: ${tags || 'any'}`);
    core.info(`📊 Max Claims: ${maxClaims}`);
    core.info(`🔍 Dry Run: ${dryRun}`);
    core.info('');

    // Fetch all bounties
    core.info('📡 Fetching bounties...');
    const bounties = await fetchBounties();
    core.info(`Found ${bounties.length} total bounties`);

    // Filter bounties
    const matched = filterBounties(bounties, { tags, minReward });
    core.info(`✅ ${matched.length} bounties match your criteria`);
    core.setOutput('matched_count', matched.length);

    if (matched.length === 0) {
      core.info('No matching bounties found. Exiting.');
      core.setOutput('claimed_count', 0);
      core.setOutput('claimed_ids', '[]');
      return;
    }

    // Log matching bounties
    core.info('');
    core.info('📋 Matching Bounties:');
    matched.forEach(b => {
      const reward = parseReward(b.reward);
      core.info(`  [${b.id}] ${b.title} - $${reward.toFixed(2)} USDC`);
      core.info(`       Tags: ${(b.tags || []).join(', ')}`);
    });
    core.info('');

    if (dryRun) {
      core.info('🔍 Dry run mode - not claiming any bounties');
      core.setOutput('claimed_count', 0);
      core.setOutput('claimed_ids', '[]');
      return;
    }

    // Claim bounties (up to maxClaims)
    const toClaim = matched.slice(0, maxClaims);
    const claimed = [];

    for (const bounty of toClaim) {
      const reward = parseReward(bounty.reward);
      core.info(`🎯 Claiming bounty #${bounty.id}: ${bounty.title} ($${reward.toFixed(2)})`);
      
      try {
        const result = await claimBounty(bounty.id, walletAddress, claimerName);
        
        if (result.success) {
          core.info(`   ✅ ${result.message}`);
          claimed.push(bounty.id);
        } else {
          core.warning(`   ❌ ${result.message}`);
        }
      } catch (error) {
        core.warning(`   ❌ Error: ${error.message}`);
      }

      // Small delay between claims to be nice to the API
      if (toClaim.indexOf(bounty) < toClaim.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    core.info('');
    core.info(`🏆 Claimed ${claimed.length} bounty(ies)`);
    
    core.setOutput('claimed_count', claimed.length);
    core.setOutput('claimed_ids', JSON.stringify(claimed));

    if (claimed.length > 0) {
      core.info('');
      core.info('💡 Next steps:');
      core.info('   1. Check the bounty board for your claimed bounties');
      core.info('   2. Complete the work according to requirements');
      core.info('   3. Submit your proof via the bounty board');
    }

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();
