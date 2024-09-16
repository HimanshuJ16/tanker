// components/bookings-pdf.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { Trip, Customer, Vehicle } from '@prisma/client'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4',
    padding: 10,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  table: {
    // display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    border: 1,
    borderColor: '#bfbfbf',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
  },
})

export const BookingsPDF = ({ bookings }: { bookings: (Trip & { vehicle: Vehicle; customer: Customer })[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Bookings Report</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Vehicle Number</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Customer Name</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Created At</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Status</Text>
            </View>
          </View>
          {bookings.map((booking) => (
            <View style={styles.tableRow} key={booking.id}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{booking.vehicle.vehicleNumber}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{booking.customer.name}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{new Date(booking.createdAt).toLocaleString()}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{booking.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
)