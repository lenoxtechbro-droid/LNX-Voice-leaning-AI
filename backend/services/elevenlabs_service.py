import re

try:
    from elevenlabs import ElevenLabs, VoiceSettings
    ELEVENLABS_AVAILABLE = True
except ImportError:
    ELEVENLABS_AVAILABLE = False

from core.config import settings


def get_elevenlabs_client():
    """Create ElevenLabs client if API key is available, otherwise return None."""
    if not ELEVENLABS_AVAILABLE:
        return None
    if not settings.ELEVENLABS_API_KEY:
        return None
    return ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)


client = get_elevenlabs_client()


def clean_text_for_speech(text: str) -> str:
    """Clean text to ensure natural voice output and eliminate spoken special characters."""
    if not text:
        return ""

    # Remove code blocks and inline code
    text = re.sub(r"```[\s\S]*?```", "", text)
    text = re.sub(r"`.*?`", "", text)

    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+", "", text)

    # Remove emojis
    text = re.sub(
        r"[\U00010000-\U0010ffff\u2600-\u26ff\u2700-\u27bf\ufe00-\ufe0f\u1f300-\u1f9ff]",
        "",
        text,
    )

    # Remove markdown formatting and unwanted spoken characters: *, #, _, ~, `, \, /, -, +, =, |, <, >, ^
    text = re.sub(r"[\*#_~`\\/\-+=\|^<>\[\]{}()]", " ", text)

    # Remove multiple spaces/newlines
    text = re.sub(r"\s+", " ", text).strip()
    return text


def text_to_speech(text: str, voice_id: str = "ErXwobaYiN019PkySvjV") -> bytes | None:
    if client is None:
        return None

    cleaned_text = clean_text_for_speech(text)
    if not cleaned_text:
        return None

    try:
        audio = client.text_to_speech.convert(
            voice_id=voice_id,
            model_id="eleven_multilingual_v2",
            text=cleaned_text,
            voice_settings=VoiceSettings(
                stability=0.50,
                similarity_boost=0.80,
                style=0.20,
                use_speaker_boost=True,
            ),
            output_format="mp3_44100_128",
        )
        return b"".join(audio)
    except Exception as e:
        print(f"ElevenLabs primary model notice ({e}), trying fallback...")
        try:
            audio = client.text_to_speech.convert(
                voice_id=voice_id,
                model_id="eleven_turbo_v2",
                text=cleaned_text,
                output_format="mp3_44100_128",
            )
            return b"".join(audio)
        except Exception as fallback_err:
            print(f"ElevenLabs TTS error: {fallback_err}")
            return None


