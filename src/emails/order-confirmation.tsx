import { Html, Body, Container, Text, Link, Heading, Section, Row, Col } from "@react-email/components";

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}

export function OrderConfirmationEmail({ orderNumber, customerName, items, total }: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Body style={{ fontFamily: "system-ui, sans-serif", padding: "20px" }}>
        <Container>
          <Heading>Order Confirmed!</Heading>
          <Text>Hi {customerName},</Text>
          <Text>Your order <strong>{orderNumber}</strong> has been confirmed.</Text>
          <Section>
            {items.map((item, i) => (
              <Row key={i}>
                <Col>{item.name} x{item.quantity}</Col>
                <Col>${item.price.toFixed(2)}</Col>
              </Row>
            ))}
          </Section>
          <Text>Total: ${total.toFixed(2)}</Text>
          <Text>You'll receive a shipping confirmation once your order is on its way.</Text>
          <Link href={`https://luxe.com/orders/${orderNumber}`}>View Order</Link>
        </Container>
      </Body>
    </Html>
  );
}
