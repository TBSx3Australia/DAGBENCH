#!/bin/bash 

function generateConfig() {
  ARCH=$(uname -s | grep Darwin)
    if [ "$ARCH" == "Darwin" ]; then
      OPTS="-it"
    else
      OPTS="-i"
    fi

  let PORT_NUMBER=14001
  let UDP_PORT=15001
  let TCP_PORT=16001

  let LEN=${#multi[@]}
  let LEN_INDEX=LEN-1
  let START_INDEX=SEQ+1
  let END_INDEX=SEQ+NUMBER_OF_NEI
  let START=`expr $START_INDEX % $LEN`
  let END=`expr $END_INDEX % $LEN`
  echo $START, $END
  FULL_NEIGHBOR=()

  if [ $END_INDEX -le $LEN_INDEX ]; then
    echo less equal
    let COUNTER=0
    for val in "${multi[@]}"; do
      if [ $COUNTER -ge $START -a $COUNTER -le $END ]; then
        FULL_NEIGHBOR+=(${val})
      fi
      let COUNTER=COUNTER+1
    done
  else
    echo larger
    let COUNTER=0
    for val in "${multi[@]}"; do
      if [ $START == $END -a $COUNTER == $START ]; then
        FULL_NEIGHBOR+=(${val})
        break
      elif [ $START -lt $END -a $COUNTER -ge $START -a $COUNTER -le $END ]; then
        FULL_NEIGHBOR+=(${val})
      elif [ $START -gt $END ]; then
        if [ $COUNTER -le $END -o $COUNTER -ge $START ]; then
          FULL_NEIGHBOR+=(${val})
        fi
      fi
      let COUNTER=COUNTER+1
    done  
  fi

  COMMAND=''
  let INDEX=0
  for val in "${FULL_NEIGHBOR[@]}"; do
    COMMAND=${COMMAND}"--arg P"${INDEX}" ${val} "
    let INDEX=INDEX+1
  done

  let FULL=10
  if [ $NUMBER_OF_NEI -lt $FULL ]; then
    let REST=$FULL-$NUMBER_OF_NEI
    let N=NUMBER_OF_NEI
    for (( i=0; i<${REST}; i++ )); do
      COMMAND=${COMMAND}"--arg P"${N}" rai-test.raiblocks.net "
      let N=N+1
    done
  fi

  echo ${COMMAND}
  jq -n ${COMMAND} -f config_template.jq > config.json
}

function startDocker() {
  docker run -d --name nano -p 7075:7075/udp -p 7075:7075 -p 7076:7076 -v $(pwd):/root/RaiBlocksTest raiblocks-node-test
}

while getopts ":m:n:s:" opt; do
    case $opt in
        m) multi+=("$OPTARG");;
        n)
            NUMBER_OF_NEI=${OPTARG}
            ;;
        s)
            SEQ=${OPTARG}
            ;;
    esac
done
shift $((OPTIND -1))

if [ $NUMBER_OF_NEI -gt 10 ]; then
  echo Need to change config_template file
else 
  generateConfig
  startDocker
fi
