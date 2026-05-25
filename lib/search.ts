import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function searchPerson(name: string, company?: string): Promise<string> {
  const query = company ? `${name} ${company}` : name
  const scriptPath = '/Users/wang/.openclaw/workspace/scripts/brave-search.py'

  try {
    const { stdout, stderr } = await execAsync(
      `python3 "${scriptPath}" "${query.replace(/"/g, '')}" 5`,
      { timeout: 30000 }
    )
    if (stderr) console.warn('Search stderr:', stderr)
    return stdout || ''
  } catch (error) {
    console.error('Search error:', error)
    return ''
  }
}
