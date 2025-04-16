from gtts import gTTS
import os

# Define personalized data
customer_name = "John Doe"
loan_amount = "50000"
agent_name = "Alex"

# Define storyboard
storyboard = [
    "Congratulations, {customer_name}!",
    "We’ve got some exciting news just for you!",
    "Your home loan for ${loan_amount} has been approved!",
    "{agent_name} your loan advisor is here to guide you every step of the way.",
    "We’re so proud to be part of this milestone in your life.",
    "Click below to proceed to the next steps."
]

# Output directory
output_dir = "public/audio"
os.makedirs(output_dir, exist_ok=True)

# Generate audio files
for i, text in enumerate(storyboard):
    filled = text.format(
        customer_name=customer_name,
        loan_amount=loan_amount,
        agent_name=agent_name
    )
    tts = gTTS(text=filled, lang="en")
    file_path = os.path.join(output_dir, f"voiceover_{i}.mp3")
    tts.save(file_path)
    print(f"Saved: {file_path}")
