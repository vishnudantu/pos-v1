import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Search, Menu, Moon, Sun, Settings, User, LogOut,
  CheckCircle, AlertCircle, Info, TrendingUp, Zap
} from 'lucide-react';
import {
  Box, Group, ActionIcon, Text, Badge, Avatar, Popover,
  Stack, ScrollArea, Divider, Tooltip, UnstyledButton, TextInput
} from '@mantine/core';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../lib/auth';

// ══ RESPONSIVE HOOK (inline per Development Bible) ══
import { useState as _useStateW, useEffect as _useEffectW } from 'react';
function useW() {
  const [_w, _setW] = _useStateW(typeof window !== 'undefined' ? window.innerWidth : 1440);
  _useEffectW(() => { const _fn = () => _setW(window.innerWidth); window.addEventListener('resize', _fn); return () => window.removeEventListener('resize', _fn); }, []);
  return _w;
}
const isMob = (_w: number) => _w < 640;
// ════════════════════════════════════════════════════════════

interface HeaderProps {
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: '1', title: 'New Grievance', message: 'Urgent grievance from Amalapuram', type: 'warning', time: '5m ago', read: false },
  { id: '2', title: 'Event Reminder', message: 'Public meeting in 2 hours', type: 'info', time: '30m ago', read: false },
  { id: '3', title: 'Media Mention', message: 'Featured in Eenadu newspaper', type: 'success', time: '1h ago', read: true },
  { id: '4', title: 'Sentiment Alert', message: 'Sentiment dropped 5% in Kakinada', type: 'error', time: '2h ago', read: true },
];

export default function Header({ onMenuToggle, sidebarCollapsed }: HeaderProps) {
  const { activePolitician, userRole, signOut } = useAuth();
  const { colorScheme, toggleColorScheme, primaryColor } = useTheme();
  const w = useW();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const unreadCount = mockNotifications.filter(n => !n.read).length;
  const profileName = activePolitician?.full_name || userRole?.email?.split('@')[0] || 'User';
  const initials = profileName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: sidebarCollapsed ? 80 : 280,
        right: 0,
        height: 64,
        background: 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        zIndex: 150,
        transition: 'left 0.3s ease',
        padding: isMob(w) ? '0 12px' : '0 24px',
      }}
    >
      <Group h="100%" justify="space-between" wrap="nowrap">
        {/* Left: Menu Toggle & Search */}
        <Group gap="md" wrap="nowrap" style={{ flex: 1 }}>
          <Tooltip label="Toggle Menu">
            <ActionIcon
              variant="transparent"
              onClick={onMenuToggle}
              style={{ color: '#8899bb' }}
            >
              <Menu size={20} />
            </ActionIcon>
          </Tooltip>

          <TextInput
            placeholder="Search grievances, voters, events..."
            leftSection={<Search size={16} color="#8899bb" />}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              flex: 1,
              maxWidth: searchFocused ? 600 : 400,
              transition: 'max-width 0.3s ease',
            }}
            styles={{
              input: {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                color: '#f0f4ff',
                fontSize: 13,
                height: 36,
              },
            }}
          />
        </Group>

        {/* Right: Actions */}
        <Group gap="xs" wrap="nowrap">
          {/* Quick Stats */}
          {!isMob(w) && (
            <Group gap="md">
              <Group gap="xs">
                <TrendingUp size={16} color="#00d4aa" />
                <Text size="xs" c="#8899bb">Sentiment: </Text>
                <Text size="xs" fw={700} c="#00d4aa">72%</Text>
              </Group>
              <Divider orientation="vertical" h={16} />
              <Group gap="xs">
                <Zap size={16} color="#ffa726" />
                <Text size="xs" c="#8899bb">Pending: </Text>
                <Text size="xs" fw={700} c="#ffa726">12</Text>
              </Group>
            </Group>
          )}

          <Divider orientation="vertical" h={24} />

          {/* Theme Toggle */}
          <Tooltip label={colorScheme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
            <ActionIcon
              variant="transparent"
              onClick={() => toggleColorScheme()}
              style={{ color: '#8899bb' }}
            >
              {colorScheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </ActionIcon>
          </Tooltip>

          {/* Notifications */}
          <Popover
            opened={notificationsOpen}
            onChange={setNotificationsOpen}
            position="bottom-end"
            width={360}
            shadow="xl"
          >
            <Popover.Target>
              <Tooltip label="Notifications">
                <ActionIcon
                  variant="transparent"
                  style={{ color: '#8899bb', position: 'relative' }}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <Badge
                      size="sm"
                      radius="xl"
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        background: primaryColor,
                        color: '#060b18',
                        fontWeight: 700,
                        minWidth: 18,
                        height: 18,
                        padding: 2,
                      }}
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </ActionIcon>
              </Tooltip>
            </Popover.Target>
            <Popover.Dropdown style={{
              background: 'rgba(15,23,42,0.98)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
            }}>
              <Group justify="space-between" mb="sm">
                <Text fw={700} c="#f0f4ff">Notifications</Text>
                <Text size="xs" c={primaryColor} style={{ cursor: 'pointer' }}>Mark all read</Text>
              </Group>
              <ScrollArea.Autosize mah={400}>
                <Stack gap="xs">
                  {mockNotifications.map((notif, i) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <UnstyledButton
                        style={{
                          width: '100%',
                          padding: 12,
                          borderRadius: 8,
                          background: !notif.read ? 'rgba(255,255,255,0.03)' : 'transparent',
                          border: !notif.read ? `1px solid ${primaryColor}33` : '1px solid transparent',
                          textAlign: 'left',
                        }}
                      >
                        <Group gap="sm" wrap="nowrap" justify="flex-start">
                          <Box style={{ flexShrink: 0 }}>
                            {notif.type === 'success' && <CheckCircle size={18} color="#00d4aa" />}
                            {notif.type === 'warning' && <AlertCircle size={18} color="#ffa726" />}
                            {notif.type === 'error' && <AlertCircle size={18} color="#ff5555" />}
                            {notif.type === 'info' && <Info size={18} color="#42a5f5" />}
                          </Box>
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text size="sm" fw={600} c="#f0f4ff" truncate>{notif.title}</Text>
                            <Text size="xs" c="#8899bb" truncate>{notif.message}</Text>
                          </Box>
                          <Text size="xs" c="#666">{notif.time}</Text>
                        </Group>
                      </UnstyledButton>
                    </motion.div>
                  ))}
                </Stack>
              </ScrollArea.Autosize>
              <Divider my="xs" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
              <Text size="xs" c="#8899bb" ta="center">View all notifications</Text>
            </Popover.Dropdown>
          </Popover>

          {/* Settings */}
          <Tooltip label="Settings">
            <ActionIcon variant="transparent" style={{ color: '#8899bb' }}>
              <Settings size={20} />
            </ActionIcon>
          </Tooltip>

          {/* Profile */}
          <Popover
            opened={profileOpen}
            onChange={setProfileOpen}
            position="bottom-end"
            width={280}
            shadow="xl"
          >
            <Popover.Target>
              <UnstyledButton>
                <Group gap="sm" wrap="nowrap">
                  <Avatar
                    size={36}
                    radius="xl"
                    src={activePolitician?.photo_url}
                    style={{ border: `2px solid ${primaryColor}66` }}
                  >
                    {initials}
                  </Avatar>
                  {!isMob(w) && (
                    <Box>
                      <Text size="sm" fw={600} c="#f0f4ff">{profileName}</Text>
                      <Text size="xs" c="#8899bb">{activePolitician?.constituency_name || 'Profile'}</Text>
                    </Box>
                  )}
                </Group>
              </UnstyledButton>
            </Popover.Target>
            <Popover.Dropdown style={{
              background: 'rgba(15,23,42,0.98)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
            }}>
              <Stack gap="xs">
                <UnstyledButton
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    color: '#8899bb',
                  }}
                >
                  <User size={18} />
                  <Text size="sm">My Profile</Text>
                </UnstyledButton>
                <UnstyledButton
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    color: '#8899bb',
                  }}
                >
                  <Settings size={18} />
                  <Text size="sm">Account Settings</Text>
                </UnstyledButton>
                <Divider style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                <UnstyledButton
                  onClick={signOut}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    color: '#ff5555',
                  }}
                >
                  <LogOut size={18} />
                  <Text size="sm">Sign Out</Text>
                </UnstyledButton>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Group>
    </Box>
  );
}
