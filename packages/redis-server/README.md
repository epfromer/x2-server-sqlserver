# x2-server-redis

REST/CRUD interface on email in Redis for X2 client.

To run PostgreSQL in a Docker container, use:

```bash
 docker run --name redis -d -p 6379:6379 redislabs/redisearch:latest --appendonly yes --aof-use-rdb-preamble yes --loadmodule /usr/lib/redis/modules/redisearch.so
```
