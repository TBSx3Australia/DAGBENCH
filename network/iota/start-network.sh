#!/bin/bash 

function generateConfig() {
  ARCH=$(uname -s | grep Darwin)
    if [ "$ARCH" == "Darwin" ]; then
      OPTS="-it"
    else
      OPTS="-i"
    fi

    # echo pull docker image
    # docker pull iotaledger/iri:v1.4.2.4

    # echo install java 8 and Maven
    # user should install java 8 and Maven

    echo clean up old data
    rm -rf ./network/iota/config_*

  COUNTER=0
  while [ $COUNTER -lt $NUMBER_OF_NODES ]; do
    # echo The counter is $COUNTER
    yes | cp -fr ./network/iota/config-template.ini ./network/iota/config_$COUNTER.ini

    let PORT_NUMBER=14001+$COUNTER
    let UDP_PORT=15001+$COUNTER
    let TCP_PORT=16001+$COUNTER

    let PREVIOUS_NEIGHBOR_IP=1+$COUNTER
    let NEXT_NEIGHBOR_IP=3+$COUNTER

    let PREVIOUS_NEIGHBOR_PORT=UDP_PORT-1
    let NEXT_NEIGHBOR_PORT=UDP_PORT+1

    BASE_NEIGHBOR_IP=udp://172.17.0.

    sed $OPTS "s/PORT_NUMBER/${PORT_NUMBER}/g" ./network/iota/config_$COUNTER.ini
    sed $OPTS "s/UDP_PORT/${UDP_PORT}/g" ./network/iota/config_$COUNTER.ini
    sed $OPTS "s/TCP_PORT/${TCP_PORT}/g" ./network/iota/config_$COUNTER.ini

    if [ $COUNTER == 0 ]; then
      sed $OPTS 's~NEIGHBORS_IP~'$BASE_NEIGHBOR_IP''${NEXT_NEIGHBOR_IP}':'${NEXT_NEIGHBOR_PORT}'~g' ./network/iota/config_$COUNTER.ini
    elif [ $COUNTER == $NUMBER_OF_NODES-1 ]; then
      sed $OPTS 's~NEIGHBORS_IP~'$BASE_NEIGHBOR_IP''${PREVIOUS_NEIGHBOR_IP}':'${PREVIOUS_NEIGHBOR_PORT}'~g' ./network/iota/config_$COUNTER.ini
    else
      sed $OPTS 's~NEIGHBORS_IP~'$BASE_NEIGHBOR_IP''${PREVIOUS_NEIGHBOR_IP}':'${PREVIOUS_NEIGHBOR_PORT}' '$BASE_NEIGHBOR_IP''${NEXT_NEIGHBOR_IP}':'${NEXT_NEIGHBOR_PORT}'~g' ./network/iota/config_$COUNTER.ini
    fi
  
    let COUNTER=COUNTER+1
  done
}

function startDocker() {
  COUNTER=0
  # docker pull iotaledger/iri:v1.4.2.4

  cd ./network/iota

  while [ $COUNTER -lt $NUMBER_OF_NODES ]; do
    let PORT_NUMBER_1=14001+$COUNTER
    let PORT_NUMBER_2=15001+$COUNTER

    docker run -d -p ${PORT_NUMBER_1}:${PORT_NUMBER_1} -p ${PORT_NUMBER_2}:${PORT_NUMBER_2}/udp -v $(pwd)/config_${COUNTER}.ini:/iri/iota.ini --name iri${COUNTER} -v $(pwd)/data:/iri/data iotaledger/iri:v1.4.2.4

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
startDocker
