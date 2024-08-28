import { pollPullRequestsWith } from "../src/pollPullRequests"
import { PullRequest1, PullRequest2, PullRequest3 } from "./PullRequests"
import { Config } from "../src/config"
import { TestLogger } from "../src/logger/test"
import { testConfig } from "./testConfig"

function setup(overrides?: { config?: Partial<Config> }) {
    const config = { ...testConfig, ...overrides?.config }
    const logger = new TestLogger()
    const pollPullRequests = pollPullRequestsWith(config, logger)
    return { config, logger, pollPullRequests }
}

describe("when no options given", () => {
    it.concurrent("it returns all PullRequests", async () => {
        const { logger, pollPullRequests } = setup()
        const PullRequests = await pollPullRequests()

        expect(PullRequests).toEqual([PullRequest3, PullRequest2, PullRequest1])
        expect(logger.getMessages()).toEqual([
            `startGroup: Pulling PullRequests from poll-github-repo/dummy-source-repo since="undefined", path="data.txt"`,
            `info: Pulled a page with 3 PullRequests`,
            `info: Extracted PullRequest {"path":"data.txt","url":"https://github.com/poll-github-repo/dummy-source-repo/PullRequest/a52684431a3fda35c2ac4cde291071a3430f2268","sha":"a52684431a3fda35c2ac4cde291071a3430f2268","message":"update data.txt (three)","date":"2022-03-14T16:23:55Z"}`,
            `info: Extracted PullRequest {"path":"data.txt","url":"https://github.com/poll-github-repo/dummy-source-repo/PullRequest/b6138d0ac3cf8fe1edc6fb48e46fefb990137746","sha":"b6138d0ac3cf8fe1edc6fb48e46fefb990137746","message":"update data.txt (two)","date":"2022-03-14T16:23:29Z"}`,
            `info: Extracted PullRequest {"path":"data.txt","url":"https://github.com/poll-github-repo/dummy-source-repo/PullRequest/3a84a578463d2b0e7f8abf4bd7a131a4ab59adaa","sha":"3a84a578463d2b0e7f8abf4bd7a131a4ab59adaa","message":"update data.txt","date":"2022-03-14T16:23:17Z"}`,
            `endGroup`,
        ])
    })
})

describe("when SINCE specified", () => {
    it.concurrent("it returns a subset", async () => {
        const { pollPullRequests } = setup()
        const PullRequests = await pollPullRequests({ since: PullRequest2.date })

        expect(PullRequests).toEqual([PullRequest3, PullRequest2])
    })
})

describe("when there are multiple pages", () => {
    it.concurrent("it still returns all PullRequests", async () => {
        const { logger, pollPullRequests } = setup()
        const PullRequests = await pollPullRequests({ per_page: 1 })

        expect(PullRequests).toEqual([PullRequest3, PullRequest2, PullRequest1])
        expect(logger.getMessages()).toEqual([
            `startGroup: Pulling PullRequests from poll-github-repo/dummy-source-repo since="undefined", path="data.txt"`,
            `info: Pulled a page with 1 PullRequests`,
            `info: Extracted PullRequest {"path":"data.txt","url":"https://github.com/poll-github-repo/dummy-source-repo/PullRequest/a52684431a3fda35c2ac4cde291071a3430f2268","sha":"a52684431a3fda35c2ac4cde291071a3430f2268","message":"update data.txt (three)","date":"2022-03-14T16:23:55Z"}`,
            `info: Pulled a page with 1 PullRequests`,
            `info: Extracted PullRequest {"path":"data.txt","url":"https://github.com/poll-github-repo/dummy-source-repo/PullRequest/b6138d0ac3cf8fe1edc6fb48e46fefb990137746","sha":"b6138d0ac3cf8fe1edc6fb48e46fefb990137746","message":"update data.txt (two)","date":"2022-03-14T16:23:29Z"}`,
            `info: Pulled a page with 1 PullRequests`,
            `info: Extracted PullRequest {"path":"data.txt","url":"https://github.com/poll-github-repo/dummy-source-repo/PullRequest/3a84a578463d2b0e7f8abf4bd7a131a4ab59adaa","sha":"3a84a578463d2b0e7f8abf4bd7a131a4ab59adaa","message":"update data.txt","date":"2022-03-14T16:23:17Z"}`,
            `info: Pulled a page with 0 PullRequests`,
            `endGroup`,
        ])
    })
})

describe("failures", () => {
    describe("when unknown owner given", () => {
        it.concurrent("it returns an empty PullRequest list", async () => {
            const { logger, pollPullRequests } = setup({ config: { repoToSyncOwner: "definitely-unknown-user-42" } })
            const PullRequests = await pollPullRequests()

            expect(PullRequests).toEqual([])
            expect(logger.getMessages()).toEqual([
                `startGroup: Pulling PullRequests from definitely-unknown-user-42/dummy-source-repo since="undefined", path="data.txt"`,
                `setFaled: Failed to pull data from GitHub: HttpError: Not Found`,
                `endGroup`,
            ])
        })
    })

    describe("when unknown repo given", () => {
        it.concurrent("it returns an empty PullRequest list", async () => {
            const { logger, pollPullRequests } = setup({ config: { repoToSync: "unknown-repo" } })
            const PullRequests = await pollPullRequests()

            expect(PullRequests).toEqual([])
            expect(logger.getMessages()).toEqual([
                `startGroup: Pulling PullRequests from poll-github-repo/unknown-repo since="undefined", path="data.txt"`,
                `setFaled: Failed to pull data from GitHub: HttpError: Not Found`,
                `endGroup`,
            ])
        })
    })

    describe("when unknown path given", () => {
        it.concurrent("it returns an empty list of PullRequests", async () => {
            const { logger, pollPullRequests } = setup({ config: { repoToSyncPath: "missing.txt" } })
            const PullRequests = await pollPullRequests()

            expect(PullRequests).toEqual([])
            expect(logger.getMessages()).toEqual([
                `startGroup: Pulling PullRequests from poll-github-repo/dummy-source-repo since="undefined", path="missing.txt"`,
                `info: Pulled a page with 0 PullRequests`,
                `endGroup`,
            ])
        })
    })

    describe("when invalid token given", () => {
        it.concurrent("it returns an empty PullRequest list ", async () => {
            const { logger, pollPullRequests } = setup({ config: { token: "invalid-token" } })
            const PullRequests = await pollPullRequests()

            expect(PullRequests).toEqual([])
            expect(logger.getMessages()).toEqual([
                `startGroup: Pulling PullRequests from poll-github-repo/dummy-source-repo since="undefined", path="data.txt"`,
                `setFaled: Failed to pull data from GitHub: HttpError: Bad credentials`,
                `endGroup`,
            ])
        })
    })
})
