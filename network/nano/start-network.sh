
function generateConfig(){
   ARCH=$(uname -s | grep Darwin)
   if [ "$ARCH" == "Darwin" ]; then
      OPTS="-it"
   else
      OPTS="-i"
   fi

   # echo build git repository
   # git clone --recursive https://github.com/nanocurrency/raiblocks.git

   # echo build docker image
   # ./docker/node/build.sh -n test

   # echo install jq
   # brew install jq

   echo clean up old data
   rm -rf ./network/nano/peer*

   COUNTER=0
   while [ $COUNTER -lt $NUMBER_OF_NODES ]; do
      cd ./network/nano
      mkdir "peer"${COUNTER}
      cd "peer"${COUNTER}
      cp -f ../config_template.jq ./config_template.jq

      let PORT=7010+$COUNTER
      let PREVIOUS_NEIGHBOR_IP=1+$COUNTER
      let NEXT_NEIGHBOR_IP=3+$COUNTER
      BASE_NEIGHBOR_IP=172.17.0.
      jq -n --arg PORT ${PORT} --arg PEER1 $BASE_NEIGHBOR_IP''${PREVIOUS_NEIGHBOR_IP} --arg PEER2 $BASE_NEIGHBOR_IP''${NEXT_NEIGHBOR_IP} -f config_template.jq > config.json

      docker run -d --name nano${COUNTER} -p 700${COUNTER}:7075/udp -p 700${COUNTER}:7075 -p 127.0.0.1:${PORT}:${PORT} -v $(pwd):/root/RaiBlocksTest raiblocks-node-test

      cd ..
      let COUNTER=COUNTER+1
   done
}


NUMBER_OF_NODES=2

while getopts "h?n:v" opt; do
   case "$opt" in
      n)
         NUMBER_OF_NODES=$OPTARG
      ;;
   esac
done

echo Generating $NUMBER_OF_NODES nodes 
generateConfig