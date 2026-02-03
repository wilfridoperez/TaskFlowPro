export async function GET(request: Request) {
    try {
        return Response.json(
            {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                app: 'running'
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Health check failed:', error);
        return Response.json(
            {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 503 }
        );
    }
}
