import React, { useMemo } from 'react'
import ListSubheader from '@mui/material/ListSubheader'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import PanToolIcon from '@mui/icons-material/PanTool'
import AcUnitIcon from '@mui/icons-material/AcUnit'
import { makeStyles } from '@mui/styles'
import { MeetSnapshot, User } from 'types'

const useStyles = makeStyles((theme) => ({
  root: {
    width: 360,
    maxHeight: 500,
    overflow: 'auto'
  },
  list: {
    background: 'white'
  },
  header: {
    background: 'white'
  },
  emptyState: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  }
}))

export const HandsUpList = ({ state = {} }: { state: MeetSnapshot }) => {
  const style = useStyles()

  function renderAvatar({ name, photo }) {
    return (
      <Avatar alt={name} src={photo}>
        {name[0]}
      </Avatar>
    )
  }

  function renderHandsUp({ id, name, photo, isHandUp }: User) {
    return (
      <ListItem button key={id}>
        <ListItemIcon>{renderAvatar({ name, photo })}</ListItemIcon>
        <ListItemText primary={name} />
        {isHandUp && <PanToolIcon />}
      </ListItem>
    )
  }

  function renderEmptyState() {
    return (
      <ListItem>
        <div className={style.emptyState}>
          <AcUnitIcon />
          No hands up here!
        </div>
      </ListItem>
    )
  }

  const mapped = useMemo(
    () =>
      Object.values(state)
        .filter((user) => user && user.isConnected)
        .sort(({ raisedAt: a }, { raisedAt: b }) => {
          if (!a) return 1
          if (!b) return -1
          if (a > b) return 1
          if (a < b) return -1
          return 0
        }),
    [state]
  )

  return (
    <Card className={style.root}>
      <List
        className={style.list}
        subheader={
          <ListSubheader className={style.header}>Hands Up</ListSubheader>
        }
      >
        {mapped.length === 0 ? renderEmptyState() : mapped.map(renderHandsUp)}
      </List>
    </Card>
  )
}
