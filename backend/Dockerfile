FROM python:3.11

WORKDIR /app

RUN apt-get update && apt-get install -y postgresql-client

COPY requirements.txt ./
COPY pip.conf /etc/pip.conf
RUN pip install -r requirements.txt

COPY . .
COPY wait-for-postgres.sh /wait-for-postgres.sh
RUN chmod +x /wait-for-postgres.sh

CMD ["/wait-for-postgres.sh", "postgres", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 