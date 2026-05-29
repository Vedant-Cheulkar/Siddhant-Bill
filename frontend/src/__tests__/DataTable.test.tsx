import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/utils';
import { DataTable, type Column } from '@shared/components/widgets/DataTable';

interface Row { id: string; name: string; value: number }

const columns: Column<Row>[] = [
  { key: 'name',  header: 'Name',  render: (r) => <span>{r.name}</span>  },
  { key: 'value', header: 'Value', render: (r) => <span>{r.value}</span> },
];

const rows: Row[] = [
  { id: '1', name: 'Alice', value: 100 },
  { id: '2', name: 'Bob',   value: 200 },
];

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={columns} data={rows} isLoading={false} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('renders row data', () => {
    render(<DataTable columns={columns} data={rows} isLoading={false} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        isLoading={false}
        emptyTitle="Nothing here"
        emptyDescription="Add something to get started."
      />
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('shows loading skeleton rows when isLoading', () => {
    render(<DataTable columns={columns} data={[]} isLoading={true} />);
    expect(screen.queryByText('Nothing here')).not.toBeInTheDocument();
  });

  it('calls onRowClick when row clicked', () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} data={rows} isLoading={false} onRowClick={onRowClick} />);
    screen.getByText('Alice').closest('tr')?.click();
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });
});
