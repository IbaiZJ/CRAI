import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

describe('Card Component', () => {
  it('should render Card with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('data-slot', 'card');
  });

  it('should apply custom className', () => {
    render(<Card className="custom-class" data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
  });

  it('should pass additional props', () => {
    render(<Card data-testid="card" id="test-card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('id', 'test-card');
  });
});

describe('CardHeader Component', () => {
  it('should render CardHeader with children', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(<CardHeader data-testid="card-header">Content</CardHeader>);
    const header = screen.getByTestId('card-header');
    expect(header).toHaveAttribute('data-slot', 'card-header');
  });

  it('should apply custom className', () => {
    render(<CardHeader className="custom-header" data-testid="card-header">Content</CardHeader>);
    const header = screen.getByTestId('card-header');
    expect(header).toHaveClass('custom-header');
  });
});

describe('CardTitle Component', () => {
  it('should render CardTitle with children', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(<CardTitle data-testid="card-title">Title</CardTitle>);
    const title = screen.getByTestId('card-title');
    expect(title).toHaveAttribute('data-slot', 'card-title');
  });

  it('should apply custom className', () => {
    render(<CardTitle className="custom-title" data-testid="card-title">Title</CardTitle>);
    const title = screen.getByTestId('card-title');
    expect(title).toHaveClass('custom-title');
  });
});

describe('CardDescription Component', () => {
  it('should render CardDescription with children', () => {
    render(<CardDescription>Description text</CardDescription>);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(<CardDescription data-testid="card-description">Description</CardDescription>);
    const description = screen.getByTestId('card-description');
    expect(description).toHaveAttribute('data-slot', 'card-description');
  });

  it('should apply custom className', () => {
    render(<CardDescription className="custom-desc" data-testid="card-description">Description</CardDescription>);
    const description = screen.getByTestId('card-description');
    expect(description).toHaveClass('custom-desc');
  });
});

describe('CardAction Component', () => {
  it('should render CardAction with children', () => {
    render(<CardAction><button>Action</button></CardAction>);
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(<CardAction data-testid="card-action">Action</CardAction>);
    const action = screen.getByTestId('card-action');
    expect(action).toHaveAttribute('data-slot', 'card-action');
  });

  it('should apply custom className', () => {
    render(<CardAction className="custom-action" data-testid="card-action">Action</CardAction>);
    const action = screen.getByTestId('card-action');
    expect(action).toHaveClass('custom-action');
  });
});

describe('CardContent Component', () => {
  it('should render CardContent with children', () => {
    render(<CardContent>Content inside</CardContent>);
    expect(screen.getByText('Content inside')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(<CardContent data-testid="card-content">Content</CardContent>);
    const content = screen.getByTestId('card-content');
    expect(content).toHaveAttribute('data-slot', 'card-content');
  });

  it('should apply custom className', () => {
    render(<CardContent className="custom-content" data-testid="card-content">Content</CardContent>);
    const content = screen.getByTestId('card-content');
    expect(content).toHaveClass('custom-content');
  });
});

describe('CardFooter Component', () => {
  it('should render CardFooter with children', () => {
    render(<CardFooter>Footer text</CardFooter>);
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    render(<CardFooter data-testid="card-footer">Footer</CardFooter>);
    const footer = screen.getByTestId('card-footer');
    expect(footer).toHaveAttribute('data-slot', 'card-footer');
  });

  it('should apply custom className', () => {
    render(<CardFooter className="custom-footer" data-testid="card-footer">Footer</CardFooter>);
    const footer = screen.getByTestId('card-footer');
    expect(footer).toHaveClass('custom-footer');
  });
});

describe('Card Full Integration', () => {
  it('should render complete card with all subcomponents', () => {
    render(
      <Card data-testid="full-card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
          <CardAction><button>Edit</button></CardAction>
        </CardHeader>
        <CardContent>
          Main content area
        </CardContent>
        <CardFooter>
          Footer area
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByText('Main content area')).toBeInTheDocument();
    expect(screen.getByText('Footer area')).toBeInTheDocument();
  });

  it('should render nested content correctly', () => {
    render(
      <Card>
        <CardContent>
          <div data-testid="nested-content">
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
          </div>
        </CardContent>
      </Card>
    );

    expect(screen.getByTestId('nested-content')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
  });
});
