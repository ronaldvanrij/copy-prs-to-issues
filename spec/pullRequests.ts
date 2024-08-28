import { PullRequest } from "../src/types"

// This PullRequest DOES have tracking issue
export const PullRequest1: PullRequest = {
    title: "data.txt",
    url: "https://github.com/poll-github-repo/dummy-source-repo/PullRequest/3a84a578463d2b0e7f8abf4bd7a131a4ab59adaa",
    body: "update data.txt",
    date: "2022-03-14T16:23:17Z",
}

// This PullRequest does NOT have tracking issue
export const PullRequest2: PullRequest = {
    title: "data.txt",
    url: "https://github.com/poll-github-repo/dummy-source-repo/PullRequest/b6138d0ac3cf8fe1edc6fb48e46fefb990137746",
    body: "update data.txt (two)",
    date: "2022-03-14T16:23:29Z",
}

// This PullRequest does NOT have tracking issue
export const PullRequest3: PullRequest = {
    title: "data.txt",
    url: "https://github.com/poll-github-repo/dummy-source-repo/PullRequest/a52684431a3fda35c2ac4cde291071a3430f2268",
    body: "update data.txt (three)",
    date: "2022-03-14T16:23:55Z",

}
