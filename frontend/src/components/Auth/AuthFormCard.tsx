import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '../ui/card';

interface AuthFormCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthFormCard({title, description, children, footer}: AuthFormCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
        {description && <CardDescription className="text-center">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter className="flex justify-center">{footer}</CardFooter>}
    </Card>
  );
}
