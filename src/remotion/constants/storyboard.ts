export const customerName = "John Doe";
export const loanAmount = "50000";
export const agentName = "Alex";

export const generateAudioFileName = (index: number) => {
  return `/audio/voiceover_${index}.mp3`;
};

export const storyboardTemplate = [
  {
    text: `Congratulations ${customerName}!`,
    audio: generateAudioFileName(0),
    fontSize: 60,
    color: "black",
  },
  {
    text: "We’ve got some exciting news just for you!",
    audio: generateAudioFileName(1),
    fontSize: 50,
    color: "blue",
  },
  {
    text: `Your home loan for ${loanAmount} has been approved!`,
    audio: generateAudioFileName(2),
    fontSize: 50,
    color: "green",
  },
  {
    text: `${agentName}, your loan advisor is here to guide you every step of the way.`,
    audio: generateAudioFileName(3),
    fontSize: 50,
    color: "darkred",
  },
  {
    text: "We’re so proud to be part of this milestone in your life.",
    audio: generateAudioFileName(4),
    fontSize: 50,
    color: "orange",
  },
  {
    text: `Thank you ${customerName} for trusting us in this journey`,
    audio: generateAudioFileName(5),
    fontSize: 50,
    color: "orange",
  },
  {
    text: "Click below to proceed to the next steps.",
    audio: generateAudioFileName(6),
    fontSize: 50,
    color: "purple",
  },
];
