const core = require("@actions/core");

async function createChatGPTAPI(apiKey) {
  // To use ESM in CommonJS, you can use a dynamic import
  const { ChatGPTAPI } = await import("chatgpt");

  const api = new ChatGPTAPI({ apiKey });

  return api;
}

function is503or504Error(err) {
  return err.message.includes("503") || err.message.includes("504");
}

async function callChatGPT(api, content, retryOn503) {
  let cnt = 0;
  while (cnt++ <= retryOn503) {
    try {
      const response = await api.sendMessage(content);
      return response;
    } catch (err) {
      if (!is503or504Error(err)) throw err;
    }
  }
}

function startConversation(api, retryOn503) {
  return {
    conversation,
    retryOn503,
    async sendMessage(message, opts) {
      let cnt = 0;
      while (cnt++ <= retryOn503) {
        try {
          const response = await api.sendMessage(message, opts);
          return response;
        } catch (err) {
          if (!is503or504Error(err)) throw err;
          core.warning(`Got "${err}", sleep for 10s now!`);
          await new Promise((r) => setTimeout(r, 10000));
        }
      }
    },
  };
}

module.exports = { createChatGPTAPI, callChatGPT, startConversation };
