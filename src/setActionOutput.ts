import { PullRequest, CreatedIssue } from "./types";
import * as core from "@actions/core";

export type ActionOutputResult = {
    newPullRequestsInSyncRepo: boolean,
    newPullRequests: string,
    createdIssues?: string,
}

export function setActionOutput(createdIssues: CreatedIssue[], newPullRequests: PullRequest[]) {
    const result: ActionOutputResult = { newPullRequestsInSyncRepo: newPullRequests.length > 0, newPullRequests: JSON.stringify(newPullRequests) }

    core.setOutput("newPullRequestsInSyncRepo", result.newPullRequestsInSyncRepo)
    core.setOutput("newPullRequests", result.newPullRequests)

    if (createdIssues.length > 0) {
        result.createdIssues = JSON.stringify(createdIssues)
        core.setOutput("createdIssues", result.createdIssues)
    }

    return result
}
