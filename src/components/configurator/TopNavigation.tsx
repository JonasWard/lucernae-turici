import { Button, Input, Popover } from 'antd';
import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaShare, FaShoppingCart } from 'react-icons/fa';
import { Email } from '../Email';
import { useNavigate } from 'react-router-dom';

interface ITopNavigationProps {
  activeName: string;
  setActiveName: (name: string) => void;
}

const NAMED_KEY_NAME = 'user_name';
const USER_PHONE_NUMBER = 'user_number';

const getStoredInfo = () => [localStorage.getItem(NAMED_KEY_NAME), localStorage.getItem(USER_PHONE_NUMBER)];

export const TopNavigation: React.FC<ITopNavigationProps> = ({ activeName, setActiveName }) => {
  const [userName, setUserName] = useState(getStoredInfo()[0]);
  const [userNumber, setUserNumber] = useState(getStoredInfo()[1]);

  const navigate = useNavigate();

  useEffect(() => {
    if (userName) localStorage.setItem(NAMED_KEY_NAME, userName);
    else localStorage.removeItem(NAMED_KEY_NAME);
    if (userNumber) localStorage.setItem(USER_PHONE_NUMBER, userNumber);
    else localStorage.removeItem(USER_PHONE_NUMBER);
  }, [userName, userNumber]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        width: 190,
        display: 'flex',
        justifyContent: 'space-between',
        left: 'calc(50vw - 95px)',
        right: 'calc(50vw - 95px)',
      }}
    >
      <Button onClick={() => navigate('/')}>
        <FaArrowLeft /> Back
      </Button>
      <Popover
        trigger='click'
        open={activeName === 'share'}
        onOpenChange={(b: boolean) => (b ? setActiveName('share') : setActiveName(''))}
        placement='bottom'
        title='Share'
      >
        <Button>
          <FaShare />
        </Button>
      </Popover>
      <Popover
        trigger='click'
        open={activeName === 'order'}
        onOpenChange={(b: boolean) => (b ? setActiveName('order') : setActiveName(''))}
        placement='bottom'
        title='Order'
        content={
          <div style={{ width: 200, height: 100, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Input value={userName ?? undefined} onChange={(e) => setUserName(e.target.value)} placeholder='Name' status={!userName ? 'warning' : undefined} />
            <Input value={userNumber ?? undefined} onChange={(e) => setUserNumber(e.target.value)} placeholder='Phone Number' />
            <Email name={userName ?? undefined} phoneNumber={userNumber ?? undefined} />
          </div>
        }
      >
        <Button>
          <FaShoppingCart />
        </Button>
      </Popover>
    </div>
  );
};
