import React, { useMemo } from 'react'
import ListSubheader from '@material-ui/core/ListSubheader'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Card from '@material-ui/core/Card'
import Avatar from '@material-ui/core/Avatar'
import PanToolIcon from '@material-ui/icons/PanTool'
import AcUnitIcon from '@material-ui/icons/AcUnit'
import { makeStyles } from '@material-ui/core'
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
