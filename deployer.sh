# Get the branch name (you can pass this from GitHub Actions)
BRANCH_NAME='develop'
PROJECT_DIR="/var/www/test.sparkagent-launchpad"

# Log file path
LOG_FILE="$PROJECT_DIR/storage/logs/deployment.log"

# Navigate to the project directory
cd $PROJECT_DIR

sudo chown -R $USER:www-data storage

git stash push --include-untracked
git stash drop
git pull origin "$BRANCH_NAME"

# Load nvm and install Node.js 18 if version being used is outdated
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

if ! command -v nvm &> /dev/null
then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
    export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

nvm install 18
nvm use 18

# Verify Node.js version
node -v
npm -v

NODE_OPTIONS="--max-old-space-size=4096" npm update --jobs=2

npm run build

PROCESS_NAME="sparkagent-launchpad"
pm2 describe $PROCESS_NAME > /dev/null
if [ $? -eq 0 ]; then
  pm2 reload $PROCESS_NAME
else
  pm2 start npm --name $PROCESS_NAME -- start
fi

# Log deployment #
echo "Deployment successful at $(date)" >> $LOG_FILE
