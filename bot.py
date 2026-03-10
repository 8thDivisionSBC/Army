import discord
from discord.ext import commands
import json
import os

# --- CONFIGURATION ---
TOKEN = 'YOUR_BOT_TOKEN_HERE'
DATA_FILE = 'applications.json'

# --- SETUP BOT & INTENTS ---
# Intents are required for the bot to read messages and commands
intents = discord.Intents.default()
intents.message_content = True 

bot = commands.Bot(command_prefix='!', intents=intents)

# --- DATABASE FUNCTIONS ---
# These simple functions read and write to a JSON file to save data
def load_data():
    if not os.path.exists(DATA_FILE):
        return {} # Return empty dictionary if file doesn't exist yet
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

# --- BOT EVENTS ---
@bot.event
async def on_ready():
    print(f'Logged in successfully as {bot.user}')
    print('Ready to receive applications!')

# --- BOT COMMANDS ---

# 1. Apply Command (For regular users)
@bot.command(name='apply')
async def apply(ctx, *, application_text: str = None):
    """Users type !apply <their message> to submit an application."""
    if application_text is None:
        await ctx.send("Please include your application message! Example: `!apply I want to join because...`")
        return

    data = load_data()
    
    # Generate a simple ID for the application based on how many exist
    app_id = str(len(data) + 1)
    
    # Save the application details
    data[app_id] = {
        "user_id": ctx.author.id,
        "username": ctx.author.name,
        "message": application_text,
        "status": "pending"
    }
    
    save_data(data)
    await ctx.send(f"✅ Your application has been submitted! (Application ID: {app_id})")

# 2. View Pending Applications Command (For Admins)
@bot.command(name='pending')
@commands.has_permissions(administrator=True)
async def pending(ctx):
    """Admins type !pending to see all unresolved applications."""
    data = load_data()
    pending_apps = {k: v for k, v in data.items() if v['status'] == 'pending'}

    if not pending_apps:
        await ctx.send("There are no pending applications right now.")
        return

    # Create a message showing all pending apps
    response = "**Pending Applications:**\n\n"
    for app_id, app_info in pending_apps.items():
        response += f"**ID:** {app_id} | **User:** {app_info['username']}\n"
        response += f"**Message:** {app_info['message']}\n"
        response += "-" * 20 + "\n"
        
    await ctx.send(response)

# 3. Accept Command (For Admins)
@bot.command(name='accept')
@commands.has_permissions(administrator=True)
async def accept(ctx, app_id: str):
    """Admins type !accept <ID> to accept an application."""
    data = load_data()
    
    if app_id not in data:
        await ctx.send(f"❌ Could not find an application with ID {app_id}.")
        return

    if data[app_id]['status'] != 'pending':
        await ctx.send("⚠️ This application has already been processed.")
        return

    # Update status and save
    data[app_id]['status'] = 'accepted'
    save_data(data)

    # Notify the user
    user_id = data[app_id]['user_id']
    user = await bot.fetch_user(user_id)
    try:
        await user.send("🟢 **Congratulations!** Your application has been ACCEPTED.")
        await ctx.send(f"✅ Application {app_id} accepted. The user has been notified.")
    except discord.Forbidden:
        await ctx.send(f"✅ Application {app_id} accepted, but the user has DMs disabled so I couldn't message them.")

# 4. Reject Command (For Admins)
@bot.command(name='reject')
@commands.has_permissions(administrator=True)
async def reject(ctx, app_id: str):
    """Admins type !reject <ID> to reject an application."""
    data = load_data()
    
    if app_id not in data:
        await ctx.send(f"❌ Could not find an application with ID {app_id}.")
        return

    if data[app_id]['status'] != 'pending':
        await ctx.send("⚠️ This application has already been processed.")
        return

    # Update status and save
    data[app_id]['status'] = 'rejected'
    save_data(data)

    # Notify the user
    user_id = data[app_id]['user_id']
    user = await bot.fetch_user(user_id)
    try:
        await user.send("🔴 **Update:** Unfortunately, your application has been REJECTED.")
        await ctx.send(f"✅ Application {app_id} rejected. The user has been notified.")
    except discord.Forbidden:
        await ctx.send(f"✅ Application {app_id} rejected, but the user has DMs disabled so I couldn't message them.")

# --- ERROR HANDLING ---
# This tells users if they try to use an admin command without permission
@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("⛔ You do not have permission to use this command.")

# --- RUN THE BOT ---
bot.run(TOKEN)