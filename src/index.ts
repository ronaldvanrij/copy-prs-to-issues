import { pollPullRequestsWith } from "./pollPullRequests"
import { renderIssueTemplatesWith } from "./renderIssueTemplates"
import { getLastSyncDateWith } from "./getLastSyncDate"
import { getLogger, Logger } from "./logger"
import { Config, load as loadConfig } from "./config"
import { createTrackingIssuesWith } from "./createTrackingIssues"
import { createSyncPullRequestWith } from "./createSyncPullRequest"
import { setActionOutput } from "./setActionOutput";
import { PullRequest } from "./types";

async function run() {
    const config = await loadConfig()
    const logger = getLogger()

    logger.startGroup("Config")
    logger.info(JSON.stringify(config, null, 4))
    logger.endGroup()

    const getLastSyncDate = getLastSyncDateWith(config, logger)
    const pollPullRequests = pollPullRequestsWith(config, logger)
    const createSyncPullRequest = createSyncPullRequestWith(config, logger)

    logger.startGroup("Fetching last sync date")
    let maybeLastSyncDate = await getLastSyncDate()
    if (!maybeLastSyncDate) {
        logger.setFailed(`Failed to pull sync date from "${config.currentRepoCachePath}" file. Does it exist?`)
    }
    const lastSyncDate = maybeLastSyncDate!.trim()
    logger.info(`Last sync date is ${lastSyncDate}`)
    logger.endGroup()

    logger.startGroup(`Fetching PullRequests since ${lastSyncDate}`)
    const PullRequests = await pollPullRequests({ since: lastSyncDate })
    logger.info(JSON.stringify(PullRequests, null, 4))
    logger.endGroup()

    const createdIssues = config.yesCreateIssues ? await createIssues(config, logger, PullRequests) : [];

    logger.startGroup("Saving last sync date")
    const syncPullRequestUrl = await createSyncPullRequest()
    logger.info(`Created PullRequest ${syncPullRequestUrl}`)
    logger.endGroup()

    logger.startGroup("Starting output creation")
    const actionOutput = setActionOutput(createdIssues, PullRequests)
    logger.info(`Set action output: ${JSON.stringify(actionOutput, null, 4)}`)
    logger.endGroup()
}

async function createIssues(config: Config, logger: Logger, pullRequests: PullRequest[]) {
    logger.startGroup("Starting rendering")
    const renderIssueTemplates = renderIssueTemplatesWith(config)

    const issuesToCreate = renderIssueTemplates(pullRequests)
    issuesToCreate.forEach(({ title, body }) => {
        logger.info("=== TITLE")
        logger.info(title)
        logger.info("=== BODY")
        logger.info(body)
    })
    logger.endGroup()

    logger.startGroup("Creating tracking issues")
    const createTrackingIssues = createTrackingIssuesWith(config, logger)
    const createdIssues = await createTrackingIssues(issuesToCreate)
    logger.info(`Created issues:`)
    logger.info(JSON.stringify(createdIssues, null, 4))
    logger.endGroup()

    return createdIssues
}

run()
