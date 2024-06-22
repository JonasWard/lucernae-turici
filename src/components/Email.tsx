import { Button } from 'antd';
import React from 'react';

type IEmailProps = {
  title?: string;
  label?: string;
  phoneNumber?: string;
  name?: string;
};

const createMailTo = (mailto: string = 'mailto:jonas.vandenbulcke@gmail.com', title?: string, phoneNumber?: string, name?: string) => {
  const localTitle = title ? `${title}` : `Lamp order for ${window.location.href}${name ? ` by ${name}` : ''}`;
  const body = `Hi there Jonas!%0D%0A
%0D%0A
I would be interested in ordering one of your lamps!%0D%0A
Specifically the following configuration:%0D%0A
%0D%0A
${window.location.href}%0D%0A
%0D%0A
Could you please provide me with a quote?%0D%0A
You can reach me at this e-mail address.%0D%0A
${phoneNumber ? `Or you can also reach me at this phone number: ${phoneNumber}%0D%0A` : ''}
%0D%0A
All the best,%0D%0A
${name ? `${name}` : ''}%0D%0A`;

  return `${mailto}?subject=${localTitle}&body=${body}&Content-Type=text/html`;
};

export const Email: React.FC<IEmailProps> = ({ title, label = 'Order via e-mail', phoneNumber, name }) => (
  <Button
    disabled={!name}
    onClick={(e) => {
      window.location.href = createMailTo(undefined, title, phoneNumber, name);
      e.preventDefault();
    }}
  >
    {label}
  </Button>
);
