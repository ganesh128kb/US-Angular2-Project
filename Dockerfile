FROM us.gcr.io/umg-dev/nginx:node-8

RUN mkdir /usr/sst-app-client

COPY package.json /usr/sst-app-client
COPY yarn.lock /usr/sst-app-client
WORKDIR /usr/sst-app-client

RUN yarn install

COPY . /usr/sst-app-client

RUN npm run build \
	&& mv dist /usr/share/nginx/html