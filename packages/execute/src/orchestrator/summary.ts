export function extractExecutionSummary(response: string): { summary: string; isSuccess: boolean } {
  const match = response.match(/<execution_summary>([\s\S]*?)<\/execution_summary>/i);
  if (!match) {
    return { summary: response.trim(), isSuccess: true };
  }

  const summary = match[1] ? match[1].trim() : '';
  const statusMatch = summary.match(/STATUS:\s*(SUCCESS|FAILURE)/i);
  const status = statusMatch?.[1]?.toUpperCase();
  const isSuccess = status ? status === 'SUCCESS' : true;
  return { summary, isSuccess };
}
