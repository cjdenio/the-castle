import { Team } from "./types/team";
import { currentChallenges } from "./state";
import challenges from "./challenges";
import { ChallengeContext } from "./challenges/lib/challenge";

import { app, listener } from "./state";

const onSolve = (team: number, index: number) => {
  return async () => {
    await setChallenge(await Team.findOneOrFail(team), index + 1, true);
  };
};

export const setChallenge = async (
  team: Team,
  index: number,
  shouldCallStart: boolean
): Promise<void> => {
  // First, de-init the existing challenge (if necessary)
  if (currentChallenges[team.id]) {
    await currentChallenges[team.id]?.challenge.remove(
      currentChallenges[team.id]?.context as ChallengeContext
    );

    currentChallenges[team.id] = null;
  }

  // Is such a challenge nonexistent?
  if (!challenges[index]) {
    if (shouldCallStart) {
      console.log(`Team ${team.id} won!!!`);
    }

    team.currentChallenge = -1;
    await team.save();
    return;
  }

  team.currentChallenge = index;
  await team.save();

  currentChallenges[team.id] = {
    challenge: challenges[team.currentChallenge],
    index: index,
    context: {
      slack: app,
      team,
      listener,
      token: process.env.SLACK_TOKEN as string,
      userToken: process.env.SLACK_USER_TOKEN as string,
      solve: onSolve(team.id, index),
      post: async (text: string, divider = true) => {
        app.client.chat.postMessage({
          text,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text,
              },
            },
            ...(divider
              ? [
                  {
                    type: "divider",
                  },
                ]
              : []),
          ],
          channel: team.channel,
          token: process.env.SLACK_TOKEN as string,
        });
      },
      data: null,
    },
  };

  currentChallenges[team.id]?.challenge.init(
    currentChallenges[team.id]?.context as ChallengeContext
  );

  if (shouldCallStart) {
    currentChallenges[team.id]?.challenge.start(
      currentChallenges[team.id]?.context as ChallengeContext
    );
  }
};
