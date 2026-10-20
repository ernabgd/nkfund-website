#!/usr/bin/env bash
# Push the commit(s) the workflow just made, with a rebase + retry when an editor pushed in the meantime.
# Used by .github/workflows/site.yml ("Commit imported posts / keep-alive heartbeat"); tested in tests/ci-push.test.mjs.
#
#   BRANCH=<branch to push to> [GIT_AUTH_HEADER="AUTHORIZATION: basic …"] [RETRY_SLEEP=5] scripts/ci/push.sh
#
# Fails (exit 1, with a GitHub Actions error annotation) when BRANCH is empty or every attempt failed, so a lost
# commit is never reported as success. GIT_AUTH_HEADER is passed per command (never written to .git/config).
set -uo pipefail

BRANCH="${BRANCH:-}"
SLEEP="${RETRY_SLEEP:-5}"
if [ -z "$BRANCH" ]; then
  echo "::error title=Push::No branch to push to (BRANCH is empty); the commit was NOT pushed."
  exit 1
fi

git_auth() {
  if [ -n "${GIT_AUTH_HEADER:-}" ]; then git -c "http.https://github.com/.extraheader=${GIT_AUTH_HEADER}" "$@"; else git "$@"; fi
}

ok=""
for attempt in 1 2 3; do
  if git_auth pull --rebase --autostash origin "$BRANCH" && git_auth push origin "HEAD:refs/heads/$BRANCH"; then
    ok=1
    break
  fi
  echo "Push failed (attempt $attempt of 3), retrying…"
  sleep $((attempt * SLEEP))
done

if [ -z "$ok" ]; then
  echo "::error title=Push::Could not push to '$BRANCH' after 3 attempts; the commit was NOT pushed."
  exit 1
fi
echo "Pushed to $BRANCH."
