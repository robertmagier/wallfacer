## Installation

1. Create .env file in the main directory to configure required ENVs

   - API_PORT - port on which API server is listening
   - INFURA_API_KEY - infura api key
   - FUSDC_ADDRESS - smart contract address
   - DB_HOST - postgres address to use
   - DB_PORT - postgress port to use
   - DB_USER - postgres user name
   - DB_PASSWORD - postgres password
   - DB_NAME - db name on postgress server
   - NEXT_PUBLIC_API_URL - API URL as seen from the frontend perspective

1. Run `sudo docker-compose up --build` to build and start server

## Design:

1. I decided to use nestjs as a backend framework simply because I know it and it is easier for me to start a new project like this.
1. I read events from each blocks because infura node for BASE doesnt allow to subscribe to specific topic. This method is not allowed.
1. I decided not to implement TRIGGGERS in SQL because SQL doesn't provide type control and it is hard to match types between nestjs implementation and sql trigger. This would lead to problems down the way. So aggreates calculation is done within nestjs.
1. I use websockets to quickly get information about new events in frontend.
1. The demo server is available at: http://51.21.77.100:3080/
1. App is deployed on AWS EC2 machine using docker.


You can check communication between backend and frontend by calling POST method on http://51.21.77.100:3001/transactions/test-insert (no body) This tests websocket communication. Recent transactions will appear on the frontend in sections `Recent Deposits` `Recent Withdrawals` and `Recent Aggregate Changes`. Sections `Deposits` and `Withdrawals` are not automatically updated. I still have to implement Context on the frontend app to make it happen. It is enough to reload the page. It will download 10 recent transactions. 


 
