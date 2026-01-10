export const GetClues = async function (catId) {
  const cat = Number(catId);
  // const result = await fetch(
  //   `https://jservice.io/api/clues?min_date=2010-01-01&category=${cat}`
  // );

  // mongo db api key : J5J9hgHLXKXfiFkdyorzhkSYKLIq8MyQLRCdMEtb3hUU670cQiKGARO7ICQONs8z

  // const result = await fetch(`api/questions-1.js`);

  // return result.json();
};


export const GetVoice = async function () {
  const voice = await fetch(
    'https://api.elevenlabs.io/v1/text-to-speech/yoZ06aMxZJJ28mfd3POQ/stream',
    {
      headers: {
        'xi-api-key': '346bdeb1472e8e8f7e7fa9cb889c982d',
      },
      body: {
        text: 'welcome to jeopardy',
        voice_settings: {
          stability: 0,
          similarity_boost: 0,
        },
      },
    }
  );

  return voice;
};
