# x2-server-sqlserver

GraphQL interface on email in SQL Server for X2 client.

To run SQL Server in a Docker container, use:

```bash
docker run --name sqlserver -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=f00bar' -p 1433:1433 -d mcr.microsoft.com/mssql/server:latest
```
