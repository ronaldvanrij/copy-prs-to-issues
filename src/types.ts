export interface PullRequest {
    title: string
    url: string
    body: string
    date: string
}

export interface IssueToCreate {
    title: string
    body: string
}

export interface CreatedIssue {
    number: number
    url: string
}
