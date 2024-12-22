const axios = require('axios');

exports.YanzGPT = (query, prompt, model = "yanzgpt-revolution-25b-v3.0") => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios({
        url: "https://api.yanzgpt.my.id/v1/chat",
        headers: {
          authorization: "Bearer yzgpt-sc4tlKsMRdNMecNy",
          "content-type": "application/json",
        },
        data: {
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: query },
          ],
          model,
        },
        method: "POST",
      });
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });
};
