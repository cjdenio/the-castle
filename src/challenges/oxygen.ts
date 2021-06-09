import { Challenge, ChallengeContext } from "./lib/challenge";

import { Request, Response } from "express";

function onRequest(ctx: ChallengeContext) {
  return async (req: Request, res: Response) => {
    if (req.method === "POST") {
      res.json({
        ok: true,
        oxygen_status: "OK",
        oxygen_reserve: "backup",
      });

      await ctx.post(
        "`Oxygen successfully switched to backup reserve.`",
        false
      );
      await ctx.solve();
      return;
    }

    res.status(405).send("Method Not Allowed");
  };
}

export default {
  name: "Team Name",

  async init(ctx: ChallengeContext) {
    ctx.data = {
      requestListener: onRequest(ctx),
    };

    ctx.httpListener.addListener(
      `/oxygen/6${ctx.team.id}763`,
      ctx.data.requestListener
    );
  },
  async start(ctx: ChallengeContext) {
    await ctx.slack.client.chat.postMessage({
      text: `THE URL IS >>>>>>> https://starship.clb.li/oxygen/6${ctx.team.id}763 <<<<<<<`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `You quickly realize that your first and most pressing problem is oxygen; your ship's main oxygen store was only designed to last the duration of the trip.

Thankfully, the ship's engineers built in a backup oxygen reserve, but it's rather difficult to access.

To switch your ship's oxygen, you'll need to make a POST request to a URL that's hidden in this message. Good luck :salute:`,
          },
        },
      ],
      channel: ctx.team.channel,
      token: ctx.token,
    });
  },
  async remove(ctx: ChallengeContext) {
    ctx.httpListener.removeListener(
      `/oxygen/6${ctx.team.id}763`,
      ctx.data.requestListener
    );
  },
} as Challenge;