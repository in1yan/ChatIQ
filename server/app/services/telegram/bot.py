import asyncio

from aiogram import Dispatcher, types
from aiogram.filters import CommandStart
from api_client import bot

dp = Dispatcher()


@dp.message(CommandStart)
async def command_start_handler(message: types.Message):
    await message.answer("Hi!. How can I help your business today?")
    print("success")


@dp.message()
async def echo_handler(message: types.Message) -> None:
    # 1. Print customer message to the terminal (This is what you requested)
    print(f"\n--- New Message Received ---")
    print(f"Customer: {message.from_user.full_name} (@{message.from_user.username})")
    print(f"Message: {message.text}")
    print(f"---------------------------\n")

    try:
        # 2. Prepare the combined message
        # Later, replace 'AI Reply' with: await get_agent_response(message.chat.id, message.text)
        customer_msg = message.text
        ai_reply = "Hello! I am your AI Business Assistant. How can I help?"

        full_response = f"📝 You said: {customer_msg}\n\n🤖 Agent: {ai_reply}"

        # 3. Send back to the sender
        await message.answer(full_response)

    except Exception as e:
        print(f"Error sending reply: {e}")


async def main() -> None:
    # Initialize Bot instance with default bot properties which will be passed to all API calls
    # bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))

    # And the run events dispatching
    await dp.start_polling(bot)


if __name__ == "__main__":
    # logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    asyncio.run(main())
