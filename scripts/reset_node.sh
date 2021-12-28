###
# This script is used for removing node from cluster
###

./yurtctl reset

# clear network settings for flannel   https://stackoverflow.com/a/61544151/17232240
ip link set cni0 down && ip link set flannel.1 down 
ip link delete cni0 && ip link delete flannel.1
