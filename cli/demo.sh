#!/usr/bin/env bash
# Demo script for Invoice Generator CLI
# Shows off the main features of the TUI

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         Invoice Generator CLI Demo - Built with Bun      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "⚠️  Bun is not installed. Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
fi

echo "✓ Bun version: $(bun --version)"
echo ""

# Navigate to CLI directory
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    bun install
    echo ""
fi

# Set up database if needed
if [ ! -f "invoice.db" ]; then
    echo "🗄️  Setting up database..."
    bunx prisma generate
    bunx prisma migrate dev --name init
    echo ""
fi

# Show stats
echo "📊 Current Statistics:"
echo "────────────────────────────────────────────────────────────"
bun run index.ts stats
echo ""

# Show available commands
echo "🎯 Available Commands:"
echo "────────────────────────────────────────────────────────────"
bun run index.ts --help
echo ""

echo "🚀 To launch the interactive TUI:"
echo "   bun run index.ts"
echo ""
echo "   Or build standalone executable:"
echo "   bun build index.ts --compile --outfile invoice"
echo "   ./invoice"
echo ""

echo "✨ Features:"
echo "   • 📋 List and view invoices with beautiful tables"
echo "   • ✨ Create invoices with interactive wizard"
echo "   • 🏢 Manage companies, customers, and services"
echo "   • 📊 View statistics dashboard"
echo "   • 🌱 Auto-seed with sample data"
echo "   • 💾 SQLite database with Prisma ORM"
echo "   • 🎨 Colorized terminal output"
echo ""
