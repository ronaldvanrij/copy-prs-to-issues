import * as github from "@actions/github"
import { Config } from "./config"
import { Commit } from "./types"
import { Logger } from "./logger"

interface Params {
    since?: string
    per_page?: number
}

export function pollCommitsWith(config: Config, logger: Logger) {
    const token = config.token
    const owner = config.repoToSyncOwner
    const repo = config.repoToSync
//    const path = config.repoToSyncPath

    return async function pollFileChanges(params?: Params): Promise<PullRequest[]> {
        const { since, per_page } = params || {}
        const octokit = github.getOctokit(token)

        const iterator = octokit.paginate.iterator(
            octokit.rest.pulls.list({
              owner,
              repo,
            })
        ).filter((pull) => Date.parse(pull.created_at) > Date.parse(since))

        const result: PullRequest[] = []

        logger.startGroup(`Pulling pull requests from ${owner}/${repo} since="${since}", path="${path}"`)
        try {
            for await (const { data } of iterator) {
                logger.info(`Pulled a page with ${data.length} commits`)
                for (const prData of data) {
                    let pr: PullRequest = {
                        title: prData.title,
                        url: prData.html_url,
                        body: prData.body,
                        date: prData.created_at
                    }
                    logger.info(`Extracted PR ${JSON.stringify(pr)}`)
                    result.push(pr)
                }
            }
        } catch (err) {
            logger.setFailed(`Failed to pull data from GitHub: ${err}`)
        }
        logger.endGroup()
        return result
    }
}
