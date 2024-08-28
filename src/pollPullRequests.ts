import * as github from "@actions/github"
import { Config } from "./config"
import { PullRequest } from "./types"
import { Logger } from "./logger"

interface Params {
    since: string
}

export function pollPullRequestsWith(config: Config, logger: Logger) {
    const token = config.token
    const owner = config.repoToSyncOwner
    const repo = config.repoToSync

    return async function pollFileChanges(params?: Params): Promise<PullRequest[]> {
        const { since } = params || {}
        const octokit = github.getOctokit(token)

        const {data} = await octokit.rest.pulls.list({
              owner,
              repo,
            })

        const result: PullRequest[] = []

        logger.startGroup(`Pulling pull requests from ${owner}/${repo} since="${since}"`)
        try {
                for (const prData of data) {

                    if (Date.parse(prData.created_at as string) < Date.parse(since as string))
                        continue

                    let pr: PullRequest = {
                        title: prData.title,
                        url: prData.html_url,
                        body: prData.body || "",
                        date: prData.created_at
                    }
                    logger.info(`Extracted PR ${JSON.stringify(pr)}`)
                    result.push(pr)
            }
        } catch (err) {
            logger.setFailed(`Failed to pull data from GitHub: ${err}`)
        }
        logger.endGroup()
        return result
    }
}
