import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ResourcesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Resources</h2>
                        <div className="flex gap-2">
                            <Link href="/dashboard/resources/employees">
                                <Button variant="outline">Employees</Button>
                            </Link>
                            <Link href="/dashboard/resources/allocations">
                                <Button variant="outline">Allocations</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-7xl">{children}</div>
        </div>
    );
}
