import { PullRequest, IssueToCreate } from "./types"
import { Config } from "./config"

const PATTERNS = new Map<string, (PullRequest: PullRequest) => string>()
PATTERNS.set("title", (PullRequest) => PullRequest.title)
PATTERNS.set("url", (PullRequest) => PullRequest.url)
PATTERNS.set("body", (PullRequest) => PullRequest.body)
PATTERNS.set("date", (PullRequest) => PullRequest.date)

function render(template: string, PullRequest: PullRequest) {
    for (const pattern of PATTERNS.keys()) {
        const fn = PATTERNS.get(pattern)!
        template = template.replace(new RegExp(`{{ ${pattern} }}`, "g"), fn(PullRequest))
    }
    return template
}

export function renderIssueTemplatesWith(config: Config) {
    const titleTemplate = config.trackingIssueTemplateTitle
    const bodyTemplate = config.trackingIssueTemplateBody

    return function renderIssueTemplates(PullRequests: PullRequest[]): IssueToCreate[] {
        return PullRequests.map(PullRequest => ({
            title: render(titleTemplate!, PullRequest),
            body: render(bodyTemplate!.join("\n"), PullRequest),
        }))
    }
}
