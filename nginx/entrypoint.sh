#!/bin/sh

set -e
# set -x

[ -z "$UPSTREAM_ICM" ] && echo "UPSTREAM_ICM is not set" && exit 1
[ -z "$UPSTREAM_PWA" ] && echo "UPSTREAM_PWA is not set" && exit 1

[ -f "/etc/nginx/conf.d/default.conf" ] && rm /etc/nginx/conf.d/default.conf
envsubst \$UPSTREAM_ICM </etc/nginx/conf.d/icm.common.tmpl > /etc/nginx/conf.d/icm.common

cat /etc/nginx/conf.d/icm.common

i=1
while true
do
  eval "export SUBDOMAIN=\$PWA_${i}_SUBDOMAIN"
  [ -z "$SUBDOMAIN" ] && break

  eval "export CHANNEL=\$PWA_${i}_CHANNEL"
  [ -z "$CHANNEL" ] && echo "PWA_${i}_CHANNEL must be set" && exit 1

  eval "export APPLICATION=\${PWA_${i}_APPLICATION:-'-'}"
  eval "export LANG=\${PWA_${i}_LANG:-'en_US'}"
  eval "export FEATURES=\${PWA_${i}_FEATURES:-'default'}"

  echo "$i SUBDOMAIN=$SUBDOMAIN CHANNEL=$CHANNEL APPLICATION=$APPLICATION LANG=$LANG FEATURES=$FEATURES"

  envsubst '$UPSTREAM_PWA,$SUBDOMAIN,$CHANNEL,$APPLICATION,$LANG,$FEATURES' </etc/nginx/conf.d/channel.conf.tmpl >/etc/nginx/conf.d/channel$i.conf

  i=$((i+1))
done

# Generate Pagespeed config based on environment variables
env | grep NPSC_ | sed -e 's/^NPSC_//g' -e "s/\([A-Z_]*\)=/\L\1=/g" -e "s/_\([a-zA-Z]\)/\u\1/g" -e "s/^\([a-zA-Z]\)/\u\1/g" -e 's/=.*$//' -e 's/\=/ /' -e 's/^/\pagespeed /' > /tmp/pagespeed-prefix.txt

env | grep NPSC_ | sed -e 's/^[^=]*=//' -e 's/$/;/' > /tmp/pagespeed-suffix.txt

paste -d" " /tmp/pagespeed-prefix.txt /tmp/pagespeed-suffix.txt >> /etc/nginx/pagespeed.conf

find /etc/nginx -name '*.conf' -print -exec cat '{}' \;

if [ -z "$*" ]
then
  /usr/local/nginx/sbin/nginx -c /etc/nginx/nginx.conf -g "daemon off;"
else
  exec "$@"
fi
