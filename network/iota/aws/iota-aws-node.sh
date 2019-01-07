#!/bin/bash 

function generateConfig() {
  ARCH=$(uname -s | grep Darwin)
    if [ "$ARCH" == "Darwin" ]; then
      OPTS="-it"
    else
      OPTS="-i"
    fi
  
  yes | cp -fr ./config-template.ini config.ini

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
  FULL_NEIGHBOR=""

  if [ $END_INDEX -le $LEN_INDEX ]; then
    echo less equal
    let COUNTER=0
    for val in "${multi[@]}"; do
      if [ $COUNTER -ge $START -a $COUNTER -le $END ]; then
        FULL_NEIGHBOR=${FULL_NEIGHBOR}"udp://"${val}":15001 "
      fi
      let COUNTER=COUNTER+1
    done
  else
    echo larger
    let COUNTER=0
    for val in "${multi[@]}"; do
      if [ $START == $END -a $COUNTER == $START ]; then
        FULL_NEIGHBOR=${FULL_NEIGHBOR}"udp://"${val}":15001 "
        break
      elif [ $START -lt $END -a $COUNTER -ge $START -a $COUNTER -le $END ]; then
        FULL_NEIGHBOR=${FULL_NEIGHBOR}"udp://"${val}":15001 "
      elif [ $START -gt $END ]; then
        if [ $COUNTER -le $END -o $COUNTER -ge $START ]; then
          FULL_NEIGHBOR=${FULL_NEIGHBOR}"udp://"${val}":15001 "
        fi
      fi
      let COUNTER=COUNTER+1
    done  
  fi
  echo $FULL_NEIGHBOR

  sed $OPTS "s/PORT_NUMBER/${PORT_NUMBER}/g" ./config.ini
  sed $OPTS "s/UDP_PORT/${UDP_PORT}/g" ./config.ini
  sed $OPTS "s/TCP_PORT/${TCP_PORT}/g" ./config.ini
  sed $OPTS "s|NEIGHBORS_IP|$FULL_NEIGHBOR|g" ./config.ini

}

function startDocker() {
  docker run -d --net=host -p 14001 -v $(pwd)/config.ini:/iri/iota.ini --name iri1 -v $(pwd)/data:/iri/data iotaledger/iri:v1.4.2.4
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

echo $NUMBER_OF_NEI, $SEQ

generateConfig
startDocker
