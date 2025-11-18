#!/bin/bash

# OpenYurt Docker Extension Build Script
# This script builds and installs the OpenYurt Docker Extension

set -e

echo "🚀 OpenYurt Docker Extension Builder"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Building extension image...${NC}"
make build-extension

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Build successful!${NC}"
echo ""

# Check if extension is already installed
if docker extension ls | grep -q "my/awesome-extension"; then
    echo -e "${YELLOW}⚠️  Extension is already installed. Updating...${NC}"
    make update-extension
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Update failed${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}✅ Extension updated successfully!${NC}"
else
    echo -e "${BLUE}📦 Step 2: Installing extension...${NC}"
    make install-extension
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Installation failed${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}✅ Extension installed successfully!${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All done!${NC}"
echo ""
echo "Next steps:"
echo "  1. Open Docker Desktop"
echo "  2. Look for 'OpenYurt' in the left sidebar"
echo "  3. Click it to see your OpenYurt services dashboard"
echo ""
echo "For development mode, run:"
echo "  cd ui && npm install && npm run dev"
echo "  docker extension dev ui-source my/awesome-extension:latest http://localhost:3000"
echo ""

