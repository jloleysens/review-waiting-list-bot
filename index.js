'use strict';

const SlackBot = require('./src/SlackBot');
const GitHubApiClient = require("./src/GitHubApiClient");
const PullRequests = require('./src/PullRequests');
const Parser = require('./src/Parser');
const _ = require('lodash');

const controller = new SlackBot().getController();

controller.hears("ls (.+)",["direct_message","direct_mention","mention"], (bot, message) => {
  const { authors, owner, repo } = new Parser(message.match[1]).parse();

  const client = new GitHubApiClient();

  client.getAllPullRequests(authors).then((prs) => {
    bot.startConversation(message, (err, convo) => {
      convo.say(':memo: Review waiting list!');

      const messages = new PullRequests(prs, owner, repo).convertToSlackMessages();

      if (messages.length > 0) {
        _.each(messages, (pr) => convo.say(pr));
        convo.say("That's all. Please review!");
      } else {
        convo.say('No pull requests for now.');
      }

      convo.next()
    })
  });
});
