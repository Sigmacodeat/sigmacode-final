# Fluentd with Elasticsearch plugin (compatible with ES 8.x)
FROM fluent/fluentd:v1.16-debian-1

USER root
# install build tools and elasticsearch plugin
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends build-essential && \
    gem install fluent-plugin-elasticsearch -v '>= 5.4.3' --no-document && \
    apt-get remove -y build-essential && apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# create buffer directory
RUN mkdir -p /fluentd/buffer && chown -R fluent:fluent /fluentd

USER fluent

# default command provided by base image
