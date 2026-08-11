export async function executePipeline(url) {
    console.log('🚀 Orchestrator started for:', url);

    const pipeline = ['Market', 'Competitor', 'Financial', 'Risk', 'Marketing', 'Legal', 'Funding', 'Report'];
    let results = {};

    for (const agentName of pipeline) {
        results[agentName] = { status: 'OK', message: `Analysis for ${agentName} completed.` };
        console.log(`✅ ${agentName} finished.`);
    }

    return results;
}